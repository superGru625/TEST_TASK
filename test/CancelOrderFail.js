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
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;
    await NFTCollectionContract.approve(AuctionContract.address, '1');
    await AuctionContract.createOrder(
      '1',
      PaymentToken1.address,
      ethers.utils.parseUnits('1', 'ether').toString(),
      (timestampBefore + 100000).toString()
    );
    console.log('create success');
  });

  it('Cancel Order', async () => {
    await PaymentToken1.connect(account2).approve(
      AuctionContract.address,
      ethers.utils.parseUnits('1.5', 'ether').toString()
    );
    await AuctionContract.connect(account2).bidOrder(
      '0',
      ethers.utils.parseUnits('1.5', 'ether').toString()
    );
    await expect(AuctionContract.cancelOrder('0')).to.be.revertedWith(
      'OrderCancel: auction has already started'
    );
    console.log('Cancel order fail because auction has already started');

    await expect(
      AuctionContract.connect(account2).cancelOrder('0')
    ).to.be.revertedWith('OrderCancel: caller is not seller');
    console.log('Cancel order fail because OrderCancel: caller is not seller');
  });
});
