// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract NFTMarket is ReentrancyGuard, Context {
    using Counters for Counters.Counter;

    Counters.Counter private _itemIds;
    Counters.Counter private _itemSold;

    uint256 public volumeTraded;

    address private owner;
    // if everybody sell a nft , contrct will get 0.01 ether from user
    uint256 private listingPrice = 0.01 ether;

    constructor() {
        owner = payable(_msgSender());
    }

    struct MarketItem {
        uint256 itemId;
        uint256 tokenId;
        uint256 price;
        address nftContract;
        address payable seller;
        address payable newOwnerNFT;
        string itemName;
        string itemDescription;
        string tokenURI;
        bool sold;
    }

    mapping(uint256 => MarketItem) private itemToMarket;

    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address newOwnerNFT,
        uint256 price,
        bool sold
    );

    event MarketItemSollen(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address newOwnerNFT,
        uint256 price,
        bool sold
    );
    

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getItems(uint256 id) public view returns (MarketItem memory) {
        return itemToMarket[id];
    }

    // new:
    function getVolumeTraded() public view returns(uint){
        return volumeTraded;
    }

    // new:
    function getItemId() public view returns(Counters.Counter memory){
        return _itemIds;
    }

    // new:
    function getItemSold() public view returns(Counters.Counter memory){
        return _itemSold;
    }

    function listNewMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        string memory name,
        string memory description,
        string memory tokenURI
    ) public payable nonReentrant {
        require(price > 0, "NFTMarket: price must be bigger than 0!");
        require(msg.value == listingPrice, "NFTMarket: pay listing price!");

        _itemIds.increment();

        uint256 itemId = _itemIds.current();

        itemToMarket[itemId] = MarketItem(
            itemId,
            tokenId,
            price,
            nftContract,
            payable(_msgSender()),
            payable(address(0)),
            name,
            description,
            tokenURI,
            false
        );

        // you can access to all functions of ERC721 with IERC721
        IERC721(nftContract).transferFrom(_msgSender(), address(this), tokenId);

        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            _msgSender(),
            address(0),
            price,
            false
        );
    }

    function sellAnItem(address nftContract, uint256 itemId)
        public
        payable
        nonReentrant
    {
        uint256 price = itemToMarket[itemId].price;
        uint256 tokenId = itemToMarket[itemId].tokenId;

        require(msg.value == price, "NFTMarket: pls pay at first!");
        require(
            _msgSender() != itemToMarket[itemId].seller,
            "NFTMarket: current owner can not buy!"
        );

        Address.sendValue(itemToMarket[itemId].seller, msg.value);
        IERC721(nftContract).transferFrom(address(this), _msgSender(), tokenId);

        itemToMarket[itemId].newOwnerNFT = payable(_msgSender());
        itemToMarket[itemId].sold = true;
        _itemSold.increment();
        volumeTraded += msg.value;
        Address.sendValue(payable(owner), listingPrice);
        emit MarketItemSollen(itemId, nftContract, tokenId, address(this), _msgSender(), price, true);
    }

    // این تابع قرار است که تعدادی از ایتم ها(یعنی چندین استراکت مارکت ایتم رو برگردونه) . به صورت آرایه ای پس باید کروشه بیاری جلوی مارکت ایتم
    // تفاوتش با مپینگ اینه که با مپینگ کردن یک استراکت میتونی به صورت جداگانه به هر اسنراکت دسترسی داشته باشی
    //  نمایش تمامی توکن هایی که در مارکت برای فروش گذاشته شده و فروش نرفته
    // نمایش توکن هایی که ادرس صفر برای فروش گذاشته
    function showMarketItem() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 unsoldItemsCounter = itemCount - _itemSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemsCounter);

        for (uint256 i = 0; i < itemCount; i++) {
            if (itemToMarket[i + 1].newOwnerNFT == address(0)) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = itemToMarket[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function showMyNFTMarketItem() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 currentIndex = 0;
        uint256 itemsCountForShowing = 0;

        //new:
        for (uint256 i = 0; i < itemCount; i++) {
            if (itemToMarket[i + 1].newOwnerNFT == _msgSender()) {
                itemsCountForShowing += 1;
            }
        }
            
        MarketItem[] memory items = new MarketItem[](itemsCountForShowing);

        for (uint256 i = 0; i < itemCount; i++) {
                if (itemToMarket[i + 1].newOwnerNFT == _msgSender()) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = itemToMarket[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }


    function showNFTReadyForSell() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 currentIndex = 0;
        uint256 itemsCountForShowing = 0;

        //new:
        for (uint256 i = 0; i < itemCount; i++) {
            if (itemToMarket[i + 1].seller == _msgSender()) {
                itemsCountForShowing += 1;
            }
        }
        MarketItem[] memory items = new MarketItem[](itemsCountForShowing);


        for (uint256 i = 0; i < itemCount; i++) {
                if (itemToMarket[i + 1].seller == _msgSender()) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = itemToMarket[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }





    // نمایش توکن هایی که اکانت صفر خرید کرده
    //                      [-My NFT-]
    // function showMyNFTMarketItem() public view returns (MarketItem[] memory) {
    //     uint256 itemCount = _itemIds.current();
    //     uint256 currentIndex = 0;
    //     uint256 itemsCountForShowing = 0;

    //     for (uint256 i = 0; i < itemCount; i++) {
    //         if (itemToMarket[i + 1].newOwnerNFT == _msgSender()) {
    //             itemsCountForShowing += 1;
    //         }

    //         MarketItem[] memory items = new MarketItem[](itemsCountForShowing);

    //         if (itemToMarket[i + 1].owner == _msgSender()) {
    //             uint256 currentId = i + 1;
    //             MarketItem storage currentItem = itemToMarket[currentId];
    //             items[currentIndex] = currentItem;
    //             currentIndex += 1;
    //         }
    //     }
    //     return items;
    // }

    //  نمایش آیتم های یا  توکن های  یوزر
    // نمایش توکن هایی که اکانت صفر برای فروش گذاشته
    //                      [-My Market NFT-]
    // function showNFTReadyForSell() public view returns (MarketItem[] memory) {
    //     uint256 itemCount = _itemIds.current();
    //     uint256 currentIndex = 0;
    //     uint256 itemsCountForShowing = 0;

    //     for (uint256 i = 0; i < itemCount; i++) {
    //         if (itemToMarket[i + 1].newOwnerNFT == _msgSender()) {
    //             itemsCountForShowing += 1;
    //         }

    //         MarketItem[] memory items = new MarketItem[](itemToMarket);

    //         if (itemToMarket[i + 1].seller == _msgSender()) {
    //             uint256 currentId = i + 1;
    //             MarketItem storage currentItem = itemToMarket[currentId];
    //             items[currentIndex] = currentItem;
    //             currentIndex += 1;
    //         }
    //     }
    //     return items;
    // }

}
//  با ایترفیس قرارداد الف میتونی از تمام دستورات قرارداد الف  در قرارداد های دیگر استعفاده کنی

// IERC721(). یعنی استفاده از توابع(ای ار سی 721 )بدون ارث بری از اون

// IERC721(nftContract).  یعنی توابعی که میخوای استفاده کنی برای این ادرس این ان اف تی باشه فقط (همین ان اف تی که مینت شده الان)

// (Address) یک لایبری هستش نحوه استفاذه ازش با اینترفیس فرق داره

//  در صفحه ی اصلی نمایش توکن های فروشی
// نمایش تمامی توکن های آدرس صفر
// نمایش توکن هایی که ادرس صفر برای فروش گذاشته
// نمایش توکن هایی که ادرس صفر خرید کرده

// function idNFTIHaveSold() {}
// function decriseOrIncreaseListingPrice() {}
