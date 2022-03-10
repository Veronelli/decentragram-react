// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

contract Decentragram {
  string public name = "Deventragram";
  
  // Image counter
  uint public imageCount = 0;
  
  // Store Images
  struct Image{
    uint id;
    string _hash;
    string description;
    uint tipAmount;
    address payable author;
  }
  
  mapping(uint => Image) public idImages;

  // Events
  event eventImageCreated(
    uint _id,
    string _hash,
    string _description,
    uint _tipAmount,
    address payable _author
  );

  event eventImageTipped(
    uint _id,
    string _hash,
    string _description,
    uint _tipAmount,
    address payable _author  
  );
  

  // Create an image
  function uploadImage(string memory _imageHash, string memory _description) public {
    require(bytes(_imageHash).length > 0, "Empty hash invalid");
    require(bytes(_description).length > 0, "Empty description invalid");
    require(msg.sender != address(0x0), "Address is invalid");

    // Increment one to imageCounter
    imageCount++; 
    idImages[1] = Image(imageCount,_imageHash, _description, 0,msg.sender);

    emit eventImageCreated(imageCount, _imageHash, _description, 0, msg.sender);
  }

  function tipImageOwner(uint _id) public payable {
    require(_id > 0 && _id <= imageCount,"The id no exist");
    Image memory image = idImages[_id];
    address payable _auther = image.author;
    address(_auther).transfer(msg.value);

    image.tipAmount = image.tipAmount + msg.value;
    idImages[_id] = image;

    emit eventImageTipped(_id, image._hash, image.description, image.tipAmount, image.author);

  }

}