const { assert } = require('chai');

const MakeNFT = artifacts.require('./MakeNFT.sol');
const NFTMarket = artifacts.require('./NFTMarket.sol');

let myContractNFTMarket;
let myContractMakeNFT;

require('chai').use(require('chai-as-promised')).should

contract('NFTMarket', (accounts) => {
    before(async () => {
        myContractNFTMarket = await NFTMarket.deployed();
        myContractMakeNFT = await MakeNFT.deployed();
    })

    describe('deployment', async () => {
        it('deploy successfully', async () => {
            const address = await myContractNFTMarket.address;

            assert.notEqual(address, 0x00, 'zero address!');
            assert.notEqual(address, '', 'empty');
            assert.notEqual(address, undefined, 'undefined');
            assert.notEqual(address, null, 'null');
        })
    })

    describe('list new item in Market', async () => {
        let nftContract;
        let tokenId ;
        const price = 1000000000000000000; // 1 ether
        const name = 'matin'
        const description = 'MatinJiri'
        const tokenURI = 'https://ipfs.infura.io/ipfs/QmcwJ3MmyCnRAxZHX75h33lJ7sJP7gXFvHoDcQNVidZxg';

        before(async () => {
            nftContract = await myContractMakeNFT.address;
            await myContractMakeNFT.createToken(tokenURI, {from:accounts[0]});
            tokenId = await myContractMakeNFT.getTokenId();

            result = await myContractNFTMarket.listNewMarketItem(nftContract, tokenId.toString(), price.toString(), name, description, tokenURI, { from: accounts[0], value: "10000000000000000", gas: "462190", gasPrice: web3.utils.toWei("20", 'gwei')});
            itemId = await myContractNFTMarket.getItemId();
        })

        it('check list item', async () => {
            assert.equal(itemId, 1, 'incorrect token ID');
            assert.equal(tokenId, 1, 'incorrect token ID');

            const eventMarketItemCreated =  result.logs[0].args;

            assert.equal(eventMarketItemCreated.itemId, itemId.toString(), 'incorrect AMarketItemCreated itemId');
            assert.equal(eventMarketItemCreated.nftContract, nftContract, 'incorrect MarketItemCreated nftContract');
            assert.equal(eventMarketItemCreated.tokenId, tokenId.toString(), 'incorrect MarketItemCreated tokenId');
            assert.equal(eventMarketItemCreated.seller, accounts[0], 'incorrect MarketItemCreated seller');
            assert.equal(eventMarketItemCreated.newOwnerNFT, 0x000, 'incorrect MarketItemCreated newOwnerNFT');
            assert.equal(eventMarketItemCreated.price, '1000000000000000000', 'incorrect MarketItemCreated price');
            assert.equal(eventMarketItemCreated.sold, false, 'incorrect MarketItemCreated sold');
        })

    });
    
    describe('Selling an Item', async () => {
        let nftContract;
        let tokenId ;
        const price = 1000000000000000000; // 1 ether
        const name = 'matin'
        const description = 'MatinJiri'
        const tokenURI = 'https://ipfs.infura.io/ipfs/QmcwJ3MmyCnRAxZHX75h33lJ7sJP7gXFvHoDcQNVidZxg';

        let itemId;
        let addressNFTMarket;

        before(async () => {
            nftContract = await myContractMakeNFT.address;
            await myContractMakeNFT.createToken(tokenURI, {from:accounts[0]});
            tokenId = await myContractMakeNFT.getTokenId();

            await myContractNFTMarket.listNewMarketItem(nftContract, tokenId.toString(), price.toString(), name, description, tokenURI, { from: accounts[0], value: "10000000000000000", gas: "462190", gasPrice: web3.utils.toWei("20", 'gwei')});
            itemId = await myContractNFTMarket.getItemId();
            addressNFTMarket = await myContractNFTMarket.address;

            result = await myContractNFTMarket.sellAnItem(nftContract, itemId, { from: accounts[1], value: price.toString()});
            itemSold = await myContractNFTMarket.getItemSold();
            volumeTrading = await myContractNFTMarket.getVolumeTraded();
        })

        
        it('check list item', async () => {
            assert.equal(tokenId, 2, 'incorrect token ID');
            assert.equal(itemId, 2, 'incorrect item ID');
            assert.equal(itemSold, 1, 'incorrect item Sold');
            assert.equal(volumeTrading, price.toString(), 'incorrect volume traded');


            const eventMarketItemSollen = result.logs[0].args

            assert.equal(eventMarketItemSollen.itemId, itemId.toString(), 'incorrect AMarketItemCreated itemId');
            assert.equal(eventMarketItemSollen.nftContract, nftContract, 'incorrect MarketItemCreated nftContract');
            assert.equal(eventMarketItemSollen.tokenId, tokenId.toString(), 'incorrect MarketItemCreated tokenId');
            assert.equal(eventMarketItemSollen.seller, addressNFTMarket, 'incorrect MarketItemCreated seller');
            assert.equal(eventMarketItemSollen.newOwnerNFT, accounts[1], 'incorrect MarketItemCreated newOwnerNFT');
            assert.equal(eventMarketItemSollen.price, price.toString(), 'incorrect MarketItemCreated price');
            assert.equal(eventMarketItemSollen.sold, true, 'incorrect MarketItemCreated sold');

        })
    })

    // describe('', async () => {
        
    //    it('check item', async () => {
    //         const itemToMarket = await myContractNFTMarket.itemToMarket(1)

    //         assert.equal(itemToMarket.itemId., , "incorrect itemId itemId itemToMarket")
    //         assert.equal(itemToMarket.tokenId, , 'incorrect tokenId itemToMarket')
    //         assert.equal(itemToMarket.price, , 'incorrect price itemToMarket')
    //         assert.equal(itemToMarket.nftContract, , 'incorrect nftContract itemToMarket')
    //         assert.equal(itemToMarket.seller, , 'incorrect seller itemToMarket')
    //         assert.equal(itemToMarket.newOwnerNFT, , "incorrect itemName newOwnerNFT itemToMarket")
    //         assert.equal(itemToMarket.itemName, ,'incorrect itemDescription itemToMarket')
    //         assert.equal(itemToMarket.itemDescription, , 'incorrect itemDescription itemDescription itemToMarket')
    //         assert.equal(itemToMarket.tokenURI, , 'incorrect tokenURI itemToMarket')
    //         assert.equal(itemToMarket.sold, , "incorrect sold itemToMarket")

    //     })   
    // })
   
})


///////////////////////*MakeNFT*/////////////////////////////

contract('MakeNFT', (accounts) => {

    before(async () => {
        myContractNFTMarket = await NFTMarket.deployed()
        myContractMakeNFT = await MakeNFT.deployed(myContractNFTMarket.address)
    })

    describe('deployment', async () => {
        it('deploy successfully', async () => {
            const address = await myContractMakeNFT.address;

            assert.notEqual(address, 0x00, 'zero address!');
            assert.notEqual(address, '', 'empty');
            assert.notEqual(address, undefined, 'undefined');
            assert.notEqual(address, null, 'null');
        })
    })

    describe('create Token', async () => {
        let result, tokenID
        const URI = 'uri22121daas2jlsdnfsdsifids'

        before(async () => {
            result = await myContractMakeNFT.createToken(URI, {from:accounts[0]});
            tokenID = await myContractMakeNFT.getTokenId();
            numOfOwners = await myContractMakeNFT.getNuberofOwners();
        })

        it('check Mint', async () => {
            assert.equal(tokenID, 1, 'incorrect token ID')
            assert.equal(numOfOwners, 1, 'incorrect counter of owners')

            const eventMint = result.logs[2].args

            assert.equal(eventMint.owner, accounts[0], 'incorrect owner of new NFT');
            assert.equal(eventMint.TokenID.toNumber(), tokenID, 'incorrect id of new NFT');
        })

        it('check Approval For All', async () => {
            const eventApprovalForAll = result.logs[1].args

            assert.equal(eventApprovalForAll.owner, accounts[0], 'incorrect ApprovalForAll owner');
            assert.equal(eventApprovalForAll.operator, myContractNFTMarket.address, 'incorrect ApprovalForAll operator');
            assert.equal(eventApprovalForAll.approved, true, 'incorrect ApprovalForAll approved');
        })

        it('check Transfer', async() => {
            const eventTransfer = result.logs[0].args

            assert.equal(eventTransfer.from, 0x00, 'incorrect adderss from Transfer ');
            assert.equal(eventTransfer.to, accounts[0], 'incorrect to Transfer');
            assert.equal(eventTransfer.tokenId.toNumber(), tokenID, 'incorrect token ID Transfer');
        })
    })


})










