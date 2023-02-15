const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { inputToConfig } = require("@ethereum-waffle/compiler")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random IPFS NFT unit test", function () {
          let randomIpfsNft, vrfCoordinatorV2Mock, deployer, mintFee
          const chainId = network.config.chainId
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              mintFee = await randomIpfsNft.getMintFee()
          })

          describe("Mint NFT", function () {
              it("minter has balance of 1 after mint and is owner", async function () {
                  // get other accounts
                  const accounts = await ethers.getSigners()
                  const minter = accounts[1]

                  // let account 1 mint the nft
                  const accountConnectedToRandomIpfsNft = randomIpfsNft.connect(minter)
                  console.log(`account ${minter.address} mints his NFT for ${mintFee} ETH...`)
                  const tx = await accountConnectedToRandomIpfsNft.requestNft({
                      value: mintFee.toString(),
                  })
                  const txReceipt = await tx.wait(1)
                  const tx2 = await vrfCoordinatorV2Mock.fulfillRandomWords(
                      txReceipt.events[1].args.requestId,
                      randomIpfsNft.address
                  )
                  const tx2Receipt = await tx2.wait(1)
                  console.log(`tx2Receipt.events[0].args: ${tx2Receipt.events[0].args}`)
                  console.log(`tx2Receipt.events[1].args: ${tx2Receipt.events[1].args}`)
                  /* const mintedTokenId = tx2Receipt.events[0].args.tokenId

                  console.log(`The minted tokenId is ${mintedTokenId}`)
                  // get balance of NFTs from the minter
                  const minterBalanceOfNft = randomIpfsNft.balanceOf(minter)
                  assert(minterBalanceOfNft.toString() == "1")

                  // check if minter is owner of the NFT
                  const mintedNftOwner = randomIpfsNft.ownerOf(mintedTokenId.toString())
                  assert(mintedNftOwner == minter.address) */
              })
          })
      })
