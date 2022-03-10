import React, { Component } from 'react';
import Web3 from 'web3';
import * as ipfsCliente from 'ipfs-http-client';
import Identicon from 'identicon.js';
import './App.css';
import Decentragram from '../abis/Decentragram.json';
import Navbar from './Navbar';
import Main from './Main';

const ipfs = ipfsCliente({host:'ipfs.infura.io',port:5001,protocol:'https'});

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      decentragram: null,
      image:'',
      loading: true, 
      images:[]
    }
  }

  async componentWillMount(){
    await this.loadWeb3();
    await this.loadBlockchainData();

  }

  async loadBlockchainData(){
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({account: accounts[0]});

    const networkID = await web3.eth.net.getId();
    const networkData = Decentragram.networks[networkID];

    if(networkData){
      const decentragram = web3.eth.Contract(Decentragram.abi,networkData.address);
      this.setState({ decentragram });
      const imageCount = await decentragram.methods.imageCount().call();
      debugger
      this.setState({imageCount})
        for(let i = 1; i <= imageCount; i++){
          const image = await decentragram.methods.idImages(i).call();
          this.setState(
            {images: [...this.state.images,image]}
          );
        }
        console.log(this.state.images);
        this.setState({loading:false});

    }
    else{
      window.alert("Decentragram contract not deployed to detect network");
    }
  }

  captureFile = event => {

    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  async loadWeb3(){
    if(window.ethereum){
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();

    }
    else if(window.web3){
      window.web3 = new Web3(window.web3.currentProvider);

    }
    else{
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!!')

    }
  }

  uploadImage = description => {
    console.log("Submitting file to ipfs...")

    //adding file to the IPFS
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      if(error) {
        console.error(error)
        return
      }

      this.setState({ loading: true })
      this.state.decentragram.methods.uploadImage(result[0].hash, description).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  tipImageOwner = (_id,tipAmount)=>{
    this.setState({loading:true});
    this.state.decentragram.methods.tipImageOwner(_id).send({from: this.state.account,value: tipAmount}).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
            images={this.state.images}
            tipImageOwner={this.tipImageOwner}
            captureFile={this.captureFile}
            uploadImage={this.uploadImage}
          />
          }
      </div>
    );
  }
}

export default App;