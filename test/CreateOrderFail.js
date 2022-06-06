const { expect } = require('chai');

describe('Auction contract', function () {
  let AuctionContract;
  let NFTCollectionContract;
  let PaymentToken1;
  let PaymentToken2;
  let account1;
  let account2;
  let account3;

  before(async () => {
    [account1, account2, account3] = await ethers.getSigners();

    const NFTCollection = await ethers.getContractFactory('NFTCollection');
    NFTCollectionContract = await NFTCollection.deploy('test', 'test', '', '');
    const Auction = await ethers.getContractFactory('Auction');
    AuctionContract = await Auction.deploy(NFTCollectionContract.address);
    const PaymentToken = await ethers.getContractFactory('PaymentToken');

    PaymentToken1 = await PaymentToken.deploy();
    PaymentToken2 = await PaymentToken.deploy();
    await PaymentToken1.mint(
      account1.address,
      ethers.utils.parseUnits('10', 'ether').toString()
    );
    await PaymentToken1.mint(
      account2.address,
      ethers.utils.parseUnits('10', 'ether').toString()
    );
    await PaymentToken1.mint(
      account3.address,
      ethers.utils.parseUnits('10', 'ether').toString()
    );
    await PaymentToken2.mint(
      account1.address,
      ethers.utils.parseUnits('10', 'ether').toString()
    );
    await PaymentToken2.mint(
      account2.address,
      ethers.utils.parseUnits('10', 'ether').toString()
    );
    await PaymentToken2.mint(
      account3.address,
      ethers.utils.parseUnits('10', 'ether').toString()
    );
    await NFTCollectionContract.mint('5');
  });

  it('Create Order Fail', async function () {
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;
    await NFTCollectionContract.approve(AuctionContract.address, '1');
    await expect(
      AuctionContract.createOrder(
        '1',
        PaymentToken1.address,
        '0',
        (timestampBefore + 100000).toString()
      )
    ).to.be.revertedWith('OrderCreate: price cannot be zero');

    console.log('failed because of price');

    await expect(
      AuctionContract.createOrder(
        '1',
        PaymentToken1.address,
        ethers.utils.parseUnits('1', 'ether').toString(),
        (timestampBefore - 1000).toString()
      )
    ).to.be.revertedWith('OrderCreate: end time is invalid');

    console.log('failed because of end time');
  });
});
