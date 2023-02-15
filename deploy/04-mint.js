const { ethers, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async function ({ getNamedAccounts }) {
    const chainId = network.config.chainId
    const { deployer } = await getNamedAccounts()

    // Basic NFT
    console.log("Mint Basic NFT..")
    const basicNft = await ethers.getContract("BasicNFT", deployer)
    const basicMintTx = await basicNft.mintNft()
    await basicMintTx.wait(1)
    console.log(`Basic NFT index 0 has tokenURI: ${await basicNft.tokenURI(0)}`)

    // Random IPFS NFT
    console.log("Mint Random IPFS NFT..")
    const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
    const mintFee = await randomIpfsNft.getMintFee()

    const randomIpfsNftTx = await randomIpfsNft.requestNft({ value: mintFee.toString() })
    const randomIpfsNftTxReceipt = await randomIpfsNftTx.wait(1)

    await new Promise(async (resolve, reject) => {
        setTimeout(resolve, 300000) // 5 minutes
        randomIpfsNft.once("NftMinted", async function () {
            console.log(`Random IPFS NFT index 0 has tokenURI: ${await randomIpfsNft.tokenURI(0)}`)
            resolve()
        })

        if (developmentChains.includes(network.name)) {
            const requestId = randomIpfsNftTxReceipt.events[1].args.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
        }
    })

    // Dynamic SVG NFT
    console.log("Mint Dynamic SVG NFT..")
    const highValue = ethers.utils.parseEther("4000")
    const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
    const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue)
    await dynamicSvgNftMintTx.wait(1)
    console.log(`Dynamic SVG NFT index 0 tokenURI: ${await dynamicSvgNft.tokenURI(0)}`)
}

module.exports.tags = ["all", "mint"]
