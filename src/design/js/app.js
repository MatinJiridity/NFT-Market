
$(function () {
    $(window).load(function () {
        PrepareNetwork();

        //new:
        $('.dropdown-oldest').one('click', function () {
            LoadMainPageOldest();
            // alert('NFTs are sort by Old.');
        });

        //new:
        $('.dropdown-item-highest').one('click', function () {
            LoadMainPageHighestPrice();
            // alert('NFTs are sort by Old.');
        });

        //new:
        $('.dropdown-item-lowest').one('click', function () {
            LoadMainPageLowestPrice();
            // alert('NFTs are sort by Old.');
        });
    });
});


var NFTContract = null;
var NFTMarketContract = null;
var web3 = null;
var JsonNFTContract = null;
var JsonNFTMarketContract = null;
var CurrentAccount = null;
var Content = null;
var IPFS_Hash = null; // we save hash of ipfs in this variable
var networkDataNFTContract = null;
var networkDataNFTContract = null;
var ListingPrice = null;

var Host_Name = 'https://ipfs.infura.io/ipfs/'; // this is a site that our hash saved ther , if we use this link it gives us our data of img
// if we need to get some sevice from a oprtator we need host and port of that oprator
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }); // we cam define of object as IPFS with ipfs.js
// XMLHtmlRequest use in ajax / we creat a object as XMLHtmlRequest in this function / by this object we can connect to URL or address (imgURL) and read datas
// XMLHtmlRequest usully use in AJAX
// ajax یک دستوری که با استفاده از ان میتونیم اطلاعات رو از کلاینت به سرور در محیط متمرکز ببریم
function makeHttpObject() {
    if ("XMLHttpRequest" in window) return new XMLHttpRequest();
    else if ("ActiveXObject" in window) return new ActiveXObject("Msxml2.XMLHTTP");
}


async function PrepareNetwork() {
    await loadWeb3();
    await LoadDataSmartContract();
    await LoadMainPage();
    await LoadAuthorPage();
    await LoadMyNFTPage();
    await SetCurrentInformation();
}

async function loadWeb3() {

    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum); // MetaMask
        await ethereum.request({ method: 'eth_requestAccounts' }).then(function (accounts) {
            CurrentAccount = accounts[0];
            web3.eth.defaultAccount = CurrentAccount;
            console.log('current account: ' + CurrentAccount);
            SetCurrentAccount();
        });
    } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
    } else {
        window.alert('Non-Ethreum browser detected!');
    }

    ethereum.on('accoontChange', handleAccountChange); // from MetaMask API 
    ethereum.on('chainChange', handleChainChange);

    web3.eth.handleRevert = true;

}


function SetCurrentAccount() {
    $('#Address').text(CurrentAccount);
    $('#addressAU').text(CurrentAccount);
}


async function handleAccountChange() {
    await ethereum.request({ method: 'eth-reqqusetAccount' }).then(function (accounts) {
        CurrentAccount = accounts[0];
        web3.eth.defaultAccount = CurrentAccount;
        console.log('current account: ' + CurrentAccount);
        window.location.reload();
        SetCurrentAccount();
    });
}

async function handleChainChange(_chainId) {
    windoe.location.reload();
    console.log('cahin changed ', _chainId);
}


async function LoadDataSmartContract() {

    await $.getJSON('MakeNFT.json', function (contractData) {
        JsonNFTContract = contractData;
    });

    await $.getJSON('NFTMarket.json', function (contractData) {
        JsonNFTMarketContract = contractData;
    });

    // console.log("JsonNFTContract: ",JsonNFTContract);
    // console.log("JsonNFTMarketContract: ",JsonNFTMarketContract);

    web3 = await window.web3;

    const networkId = await web3.eth.net.getId();
    // console.log("networkId: ",networkId)

    networkDataNFTContract = await JsonNFTContract.networks[networkId];
    networkDataNFTMarketContract = await JsonNFTMarketContract.networks[networkId];

    // console.log("networkDataNFTContract:",  networkDataNFTContract);
    // console.log("networkDataNFTMarketContract:",  networkDataNFTMarketContract);



    if (networkDataNFTContract && networkDataNFTContract) {
        // console.log("JsonNFTContract.abi:",  JsonNFTContract.abi);
        // console.log("networkDataNFTContract.address:",  networkDataNFTContract.address);
        // console.log("JsonNFTMarketContract.abi:",  JsonNFTMarketContract.abi);
        // console.log("networkDataNFTMarketContract.address:",  networkDataNFTMarketContract.address);


        NFTContract = new web3.eth.Contract(JsonNFTContract.abi, networkDataNFTContract.address);
        NFTMarketContract = new web3.eth.Contract(JsonNFTMarketContract.abi, networkDataNFTMarketContract.address);

        ListingPrice = await NFTMarketContract.methods.getListingPrice().call();
        console.log("ListeningPrice:", ListingPrice);

    }

    $(document).on('click', '#CreateItemNFT', CreateItemNFT);

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getImageSRC(imgURL) {

    var request = makeHttpObject();
    request.open("GET", imgURL, true);
    request.send(null);

    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            Content = request.responseText;
            //     console.log("Content: ",Content);
        }
    }
}


async function LoadMainPage() {
    var itemSell = await NFTMarketContract.methods.showMarketItem().call();
    console.log('itemSell: ', itemSell);

    for (let i = itemSell.length - 1; i >= 0; i--) {
        // console.log('itemSell[',i,']: ', itemSell[i]);

        getImageSRC(itemSell[i].tokenURI)
        await sleep(100);
        sellerNFT = itemSell[i].seller.slice(0, 6) + '...' + itemSell[i].seller.slice(38, 42);

        var htmlTagC =
            '<div class="col-md-6 col-lg-4 col-xl-3 mb-4-nft" >' +
            '<div class="creators">' +
            '<div class="creatorImg"><img id="image_nft" src=' + Content + ' alt="img"></div>' +
            '</div>' +
            '<div class="bgdarkbluecolor aboutitemcnt">' +
            '<div class="itemtitlecode">' +
            '<h2 class="textgraycolor">' + itemSell[i].itemName + '</h2>' +
            '<h3 class="textwhitecolor">' + itemSell[i].itemDescription + '</h3>' +
            '<h4 style="color: white;">Seller:' + sellerNFT + '</h4>' +
            '</div>' +
            '<div class="itemtitlePrice">' +
            '<h2 class="textgraycolor">Price</h2>' +
            '<h3 class="textwhitecolor"><img src="img/priceicon.svg"> <strong>' + web3.utils.fromWei(itemSell[i].price, 'ether') + '</strong></h3>' +
            '<input type="button" class="btn btn-success" value="Buy" onclick = "BuyNFT(' + itemSell[i].itemId + ')">' +
            '</div>' +
            '</div>' +

            '</div>' +
            '</div>';

        $('#BuyNFT').append(htmlTagC);

    }
}

//new:
async function LoadMainPageOldest() {
    var itemSell = await NFTMarketContract.methods.showMarketItem().call();
    // console.log('itemSell: ', itemSell);

    $('.ShowNFTs').replaceWith($('.shownft').clone());
    $('.ShowNFTs').hide();


    for (let i = 0; i < itemSell.length; i++) {
        // console.log('itemSell[',i,']: ', itemSell[i]);

        getImageSRC(itemSell[i].tokenURI)
        await sleep(100);
        sellerNFT = itemSell[i].seller.slice(0, 6) + '...' + itemSell[i].seller.slice(38, 42);

        var htmlTagC =
            '<div class="col-md-6 col-lg-4 col-xl-3 mb-4-nft" >' +
            '<div class="creators">' +
            '<div class="creatorImg"><img id="image_nft" src=' + Content + ' alt="img"></div>' +
            '</div>' +
            '<div class="bgdarkbluecolor aboutitemcnt">' +
            '<div class="itemtitlecode">' +
            '<h2 class="textgraycolor">' + itemSell[i].itemName + '</h2>' +
            '<h3 class="textwhitecolor">' + itemSell[i].itemDescription + '</h3>' +
            '<h4 style="color: white;">Seller:' + sellerNFT + '</h4>' +
            '</div>' +
            '<div class="itemtitlePrice">' +
            '<h2 class="textgraycolor">Price</h2>' +
            '<h3 class="textwhitecolor"><img src="img/priceicon.svg"> <strong>' + web3.utils.fromWei(itemSell[i].price, 'ether') + '</strong></h3>' +
            '<input type="button" class="btn btn-success" value="Buy" onclick = "BuyNFT(' + itemSell[i].itemId + ')">' +
            '</div>' +
            '</div>' +

            '</div>' +
            '</div>';

        $('#buynft').append(htmlTagC);

    }
}

//new:
async function LoadMainPageHighestPrice() {

    $('.ShowNFTs').replaceWith($('.ShowNFTsHighest').clone());
    $('.ShowNFTs').hide();

    var itemSell = await NFTMarketContract.methods.showMarketItem().call();
    var listPrice = [];

    
    for (let i = 0; i < itemSell.length; i++) {

        // console.log(typeof(itemSell[i].price*1))
        listPrice.push(itemSell[i].price * 1)

    }
    // console.log(listPrice)
    var highesttolowest = listPrice.sort((a, b) => b - a);
    console.log(highesttolowest)


    for (let x = 0; x < highesttolowest.length; x++) {

        for (let i = 0; i < itemSell.length; i++) {
         
            if (highesttolowest[x] == itemSell[i].price * 1) {
                console.log(highesttolowest[x], x, itemSell[i].price * 1, i);
                
                getImageSRC(itemSell[i].tokenURI)
                await sleep(100);
                sellerNFT = itemSell[i].seller.slice(0, 6) + '...' + itemSell[i].seller.slice(38, 42);
    
                var htmlTagC = 
                    '<div class="col-md-6 col-lg-4 col-xl-3 mb-4-nft" >'+
                    '<div class="creators">'+
                        '<div class="creatorImg"><img id="image_nft" src='+Content+' alt="img"></div>'+
                    '</div>'+
                                '<div class="bgdarkbluecolor aboutitemcnt">'+
                                    '<div class="itemtitlecode">'+
                                        '<h2 class="textgraycolor">'+itemSell[i].itemName+'</h2>'+
                                        '<h3 class="textwhitecolor">'+itemSell[i].itemDescription+'</h3>'+
                                        '<h4 style="color: white;">Seller:'+sellerNFT +'</h4>'+
                                    '</div>'+
                                    '<div class="itemtitlePrice">'+
                                        '<h2 class="textgraycolor">Price</h2>'+
                                        '<h3 class="textwhitecolor"><img src="img/priceicon.svg"> <strong>'+web3.utils.fromWei( itemSell[i].price, 'ether')+'</strong></h3>'+
                                        '<input type="button" class="btn btn-success" value="Buy" onclick = "BuyNFT('+ itemSell[i].itemId +')">'+
                                    '</div>'+
                                '</div>'+
    
                            '</div>'+
                        '</div>';
    
                $('#buynfthighest').append(htmlTagC);

                break;
            }  

        }
    }
}

//new:
async function LoadMainPageLowestPrice() {

    $('.ShowNFTs').replaceWith($('.ShowNFTsLowest').clone());
    $('.ShowNFTs').hide();

    var itemSell = await NFTMarketContract.methods.showMarketItem().call();
    var listPrice = [];

    for (let i = 0; i < itemSell.length; i++) {

        // console.log(typeof(itemSell[i].price*1))
        listPrice.push(itemSell[i].price * 1)

    }
    // console.log(listPrice)
    var lowesttoHighest = listPrice.sort((b, a  ) => b - a);
    console.log(lowesttoHighest)

    for (let x = 0; x < lowesttoHighest.length; x++) {

        for (let i = 0; i < itemSell.length; i++) {
         
            if (lowesttoHighest[x] == itemSell[i].price * 1) {
                console.log(lowesttoHighest[x], x, itemSell[i].price * 1, i);
                
                getImageSRC(itemSell[i].tokenURI)
                await sleep(100);
                sellerNFT = itemSell[i].seller.slice(0, 6) + '...' + itemSell[i].seller.slice(38, 42);
    
                var htmlTagC = 
                    '<div class="col-md-6 col-lg-4 col-xl-3 mb-4-nft" >'+
                    '<div class="creators">'+
                        '<div class="creatorImg"><img id="image_nft" src='+Content+' alt="img"></div>'+
                    '</div>'+
                                '<div class="bgdarkbluecolor aboutitemcnt">'+
                                    '<div class="itemtitlecode">'+
                                        '<h2 class="textgraycolor">'+itemSell[i].itemName+'</h2>'+
                                        '<h3 class="textwhitecolor">'+itemSell[i].itemDescription+'</h3>'+
                                        '<h4 style="color: white;">Seller:'+sellerNFT +'</h4>'+
                                    '</div>'+
                                    '<div class="itemtitlePrice">'+
                                        '<h2 class="textgraycolor">Price</h2>'+
                                        '<h3 class="textwhitecolor"><img src="img/priceicon.svg"> <strong>'+web3.utils.fromWei( itemSell[i].price, 'ether')+'</strong></h3>'+
                                        '<input type="button" class="btn btn-success" value="Buy" onclick = "BuyNFT('+ itemSell[i].itemId +')">'+
                                    '</div>'+
                                '</div>'+
    
                            '</div>'+
                        '</div>';
    
                $('#buynftlowest').append(htmlTagC);

                break;
            }  

        }

    }

}

//new:
async function SetCurrentInformation() {

    var items = await NFTMarketContract.methods.showMarketItem().call();
    var itemCounts = items.length;
    // console.log(itemCounts);
    $('#itemCounts').text(itemCounts);
    
    var numberOfOwners = await NFTContract.methods.getNuberofOwners().call();
    $('#numberOfOwners').text(numberOfOwners);

    var volumeTraded = await NFTMarketContract.methods.getVolumeTraded().call();
    $('#volumeTraded').text(web3.utils.fromWei(volumeTraded, 'ether'));

    // $('#listPrice').text(web3.utils.fromWei(ListingPrice, 'ether'));
    
    var items = await NFTMarketContract.methods.showMarketItem().call();
    var listItemPrice = [];

    for (let i = 0; i < items.length; i++) {
        listItemPrice.push(items[i].price*1)
    }

    // console.log(Math.min(...listItemPrice));
    var floorPrice = Math.min(...listItemPrice)
    $('#floorPrice').text(web3.utils.fromWei(floorPrice.toString(), 'ether'));


}


async function LoadAuthorPage() {
    var ItemsOwner = await NFTMarketContract.methods.showNFTReadyForSell().call();
    console.log('ItemsOwner: ', ItemsOwner);

    for (let i = ItemsOwner.length - 1; i >= 0; i--) {
        // console.log('ItemsOwner[',i,']: ', ItemsOwner[i]);
        getImageSRC(ItemsOwner[i].tokenURI)
        await sleep(100);
        sellerNFT = ItemsOwner[i].seller.slice(0, 6) + '...' + ItemsOwner[i].seller.slice(38, 42);

        var htmlTagC =
            '<div class="col-md-6 col-lg-4 col-xl-3 mb-4-nft" >' +
            '<div class="creators">' +
            '<div class="creatorImg"><img id="image_nft" src=' + Content + ' alt="img"></div>' +
            '</div>' +
            '<div class="creatorsText text-center">' +
            '<h2 class="textwhitecolor">' + ItemsOwner[i].itemName + '</h2>' +
            '<h3 class="textbluecolor">@' + ItemsOwner[i].itemDescription + '</h3>' +
            '<div class="authorEarn text-center mt-2">' +
            '<div class="">' +
            '<span class="textgraycolor">Price</span>' +
            '<strong class="textwhitecolor"><img class="img-fluid" src="img/priceicon.svg" alt="img">' + web3.utils.fromWei(ItemsOwner[i].price, 'ether') + '</strong>' +
            '</div>' +

            '</div>' +
            '</div>' +
            '</div>';
        $('#itemAuthor').append(htmlTagC);

    }
}

async function LoadMyNFTPage() {
    var ItemsOwner = await NFTMarketContract.methods.showMyNFTMarketItem().call();
    // console.log('ItemsOwner: ', ItemsOwner);

    for (let i = ItemsOwner.length - 1; i >= 0; i--) {
        // console.log('ItemsOwner[',i,']: ', ItemsOwner[i].itemName);

        getImageSRC(ItemsOwner[i].tokenURI)
        await sleep(100);
        sellerNFT = ItemsOwner[i].seller.slice(0, 6) + '...' + ItemsOwner[i].seller.slice(38, 42);

        var htmlTagC =
            '<div class="col-md-6 col-lg-4 col-xl-3 mb-4-nft" >' +
            '<div class="creators">' +
            '<div class="creatorImg"><img id="image_nft" src=' + Content + ' alt="img"></div>' +
            '</div>' +
            '<div class="creatorsText text-center">' +
            '<h2 class="textwhitecolor">' + ItemsOwner[i].itemName + '</h2>' +
            '<h3 class="textbluecolor">@' + ItemsOwner[i].itemDescription + '</h3>' +
            '<div class="authorEarn text-center mt-2">' +

            '<div class="col-md-2">' +
            // '<span class="textgraycolor">Price</span>'+
            // '<strong class="textwhitecolor"><img class="img-fluid" src="img/priceicon.svg" alt="img">'+web3.utils.fromWei( ItemsOwner[index].price, 'ether')+'</strong>'+
            // '<div class="row">'+
            //     '<div class="col-md-8">'+
            //         '<input type="text" class="" value="Sell" style="margin-top:10px;" >'+
            //     '</div>'+
            //     '<div class="col-md-4">'+
            //         '<input type="button" class="btn btn-success" value="Sell" style="margin-top:10px;" >'+
            //     '</div>'+
            // '</div>'+

            // '<input type="number" id="pricesell" style="margin-top:10px;" placeholder="ether">'+
            // '<br/>'+
            // '<input type="button" class="btn btn-success" value="Sell(ether)" style="margin-top:10px;" onclick = "TransferNFT('+ ItemsOwner[index].itemId +')">'+

            '</div>' +
            // '<div class="col-md-6">'+
            //     '<input type="button" class="btn btn-success" value="Buy" onclick = "TransferNFT('+ ItemsOwner[index].itemId +')">'+
            // '</div>'+
            '</div>' +
            '</div>' +
            '</div>';
        $('#itemnftAuthor').append(htmlTagC);

    }
}


// id arguman refers itemSell[i].itemId in html : see loadMainPage()
async function BuyNFT(id) {
    console.log(id);

    var item = await NFTMarketContract.methods.getItems(id).call();
    console.log('item: ', item);

    NFTMarketContract.methods.sellAnItem(item.nftContract, id).send({ from: CurrentAccount, value: item.price }).then(function (instance) {
        // console.log(instance)
        
        $.msgBox({
            title: "You bught",
            content: "New Owner: " + CurrentAccount.slice(0, 6) + "..." + CurrentAccount.slice(38, 42),
            typr: "alert"
        });

    }).catch(function (error) {
        console.log("error: ", error);
    })
}


// تیس توی اچ تی ام ال اشاره به تگی که داره میکند و اون تگ اینپوت میده به تابع ما
function readURL(input) {

    if (input.files && input.files[0]) {
        const file = input.files[0];
        var reader = new FileReader(file);
        reader.readAsDataURL(file);

        reader.onload = async function (e) {

            $('.image-upload-wrap').hide();

            $('.file-upload-image').attr('src', e.target.result);
            $('.file-upload-content').show();

            $('.image-title').html(input.files[0].name);

            Content = reader.result;

            $("#overlay").fadeIn(300);

            await ipfs.add(Content, function (err, hash) {
                if (err) {
                    console.log(err);
                    return false;
                } else {
                    IPFS_Hash = hash;
                    console.log("IPFS_Hash", IPFS_Hash);
                    $("#overlay").fadeOut(300);
                }
            });


        }

    } else {
        removeUpload();
    }

}


function CreateItemNFT() {

    var price = $("#price").val();
    var itemname = $("#itemname").val();
    var description = $("#description").val();

    if (description.trim() == '' & price.trim() == '' & itemname.trim() == '') {
        $.msgBox({
            title: "Alert Box",
            content: "Please Fill Description!",
            type: "error"
        });
        return;
    }

    price = web3.utils.toWei(price, 'ether');
    var TokenURI = Host_Name + IPFS_Hash;

    let tokenId = null;

    NFTContract.methods.createToken(TokenURI).send({ from: CurrentAccount }).then(function (Instance) {
        // console.log(Instance)

        tokenId = Instance.events.Mint.returnValues[1];
        console.log("tokenId", tokenId);

        Oaddress = Instance.events.Mint.returnValues[0];

        $.msgBox({
            title: "NFT Created",
            content: "Owner: " + Oaddress.slice(0, 6) + "..." + Oaddress.slice(38, 42),
            type: "alert"
        });


        NFTMarketContract.methods.listNewMarketItem(networkDataNFTContract.address, tokenId, price, itemname, description, TokenURI).send({ from: CurrentAccount, value: ListingPrice }).then(function (Instance) {
            console.log(Instance)

            let Oaddress = Instance.events.MarketItemCreated.returnValues[3];

            $.msgBox({
                title: "NFT Save to NFT Market",
                content: "Seller: " + Oaddress.slice(0, 6) + "..." + Oaddress.slice(38, 42),
                type: "alert"
            });


        }).catch(function (error) {
            console.log("error: ", error);
        });

    }).catch(function (error) {
        console.log("error: ", error);
    });

}


function CreatePage() {
    location.replace("create.html")
}

function MyNFT() {
    location.replace("mynft.html")
}

function MyMarketNFT() {
    location.replace("author.html")
}

function back() {
    location.replace("index.html")
}


// My NFT button: show NFTs wich I have bught them from this Market => showMyNFTMarketItem()
// My Market NFT button: show NFTs wich I have minted in this Market => showNFTReadyForSell()
// mainPage: shows NFTs wich they did not have been sold from this Market  =>()



// // Prints "1, 2, 3"
// const arr = [1, 2, 3, 4, 5];

// // Instead of trying to `break`, slice out the part of the array that `break`
// // would ignore.
// arr.slice(0, arr.findIndex(v => v > 3)).forEach(v => {
//   console.log(v);
// });






