const MakeNFT = artifacts.require("MakeNFT");
const NFTMarket = artifacts.require("NFTMarket");

module.exports = function (deployer) {
  deployer.deploy(NFTMarket).then(function () {
      return deployer.deploy(MakeNFT, NFTMarket.address)
  });
};
