const { expect } = require('chai');
const { time } = require('@openzeppelin/test-helpers');

require('@openzeppelin/test-helpers/configure')({
  provider: 'http://localhost:8545',
});

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
      (timestampBefore + 1000).toString()
    );
    console.log('create success');
  });

  it('Settle Order', async () => {
    await PaymentToken1.connect(account2).approve(
      AuctionContract.address,
      ethers.utils.parseUnits('1.5', 'ether').toString()
    );
    await AuctionContract.connect(account2).bidOrder(
      '0',
      ethers.utils.parseUnits('1.5', 'ether').toString()
    );
    await ethers.provider.send('evm_increaseTime', [100]);

    await expect(AuctionContract.settleOrder('0')).to.be.revertedWith(
      'OrderSettle: auction is not expired'
    );
    console.log('Settle order failed because auction is not expired');
  });
});
