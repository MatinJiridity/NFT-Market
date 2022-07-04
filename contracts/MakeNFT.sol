// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// Counters: labrary for tokenID, tokenId ++ 
// ERC721URIStorage: in this abstract contract we save link of image of our NFT
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MakeNFT is ERC721URIStorage {
    
    using Counters for Counters.Counter;

    Counters.Counter private tokenId;
    Counters.Counter public numberofOwners;     // new:

    address private NFTMarket;

    event Mint(address owner, uint TokenID);

    constructor(address nftMarketAdress) ERC721("MATIN", "MTN") {
        NFTMarket = nftMarketAdress;
    } 

    // new:
    mapping(address => bool) public hasMaked;   // hasMaked[_msgSender()] = true

    function getTokenId() public view returns(Counters.Counter memory){
        return tokenId;
    }

    // new:
    function getNuberofOwners() public view returns(Counters.Counter memory) {
        return numberofOwners;
    }

    function createToken(string memory tokenURI) public returns (uint) {
        if (!hasMaked[_msgSender()]) {
            numberofOwners.increment();
        }

        tokenId.increment();
        uint newTokenID = tokenId.current(); 
        
        _mint(_msgSender(), newTokenID);
        _setTokenURI(newTokenID, tokenURI);
        setApprovalForAll(NFTMarket, true);
        hasMaked[_msgSender()] = true;
        emit Mint(_msgSender(), newTokenID);

        return newTokenID;
    }
}   


