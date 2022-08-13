import { ethers, network } from 'hardhat';

async function main() {
  const rsvpContractFactory = await ethers.getContractFactory('Web3RSVP');
  const rsvpContract = await rsvpContractFactory.deploy();
  await rsvpContract.deployed();

  console.log('Contract deployed to:', rsvpContract.address);

  // Access different test wallets to simulate different wallets interacting with our contract
  const [deployer, address1, address2] = await ethers.getSigners();

  // Define event data for testing
  const deposit = ethers.utils.parseEther('1');
  const maxCapacity = 3;
  const timestamp = 1718926200;
  const eventDataCID =
    'bafybeibhwfzx6oo5rymsxmkdxpmkfwyvbjrrwcl7cekmbzlupmp5ypkyfi';

  // Create a new event with mock data
  let txn = await rsvpContract.createNewEvent(
    timestamp,
    deposit,
    maxCapacity,
    eventDataCID
  );
  let wait = await txn.wait();
  console.log(
    'NEW EVENT CREATED:',
    wait?.events?.[0].event,
    wait?.events?.[0].args
  );

  let eventID = wait?.events?.[0].args?.eventID;
  console.log('EVENT ID:', eventID);

  // RSVP to event with mock data and deployer address
  txn = await rsvpContract.createNewRSVP(eventID, { value: deposit });
  wait = await txn.wait();
  console.log('NEW RSVP:', wait?.events?.[0].event, wait?.events?.[0].args);

  // RSVP to event with mock data and another address
  txn = await rsvpContract
    .connect(address1)
    .createNewRSVP(eventID, { value: deposit });
  wait = await txn.wait();
  console.log('NEW RSVP:', wait?.events?.[0].event, wait?.events?.[0].args);

  // RSVP to event with mock data and another address
  txn = await rsvpContract
    .connect(address2)
    .createNewRSVP(eventID, { value: deposit });
  wait = await txn.wait();
  console.log('NEW RSVP:', wait?.events?.[0].event, wait?.events?.[0].args);

  // Confirm all attendees with mock data
  txn = await rsvpContract.confirmAllAttendees(eventID);
  wait = await txn.wait();
  wait?.events?.forEach((event: any) =>
    console.log('CONFIRMED:', event.args.attendeeAddress)
  );

  // Withdraw unclaimed deposits, but first simulate the passing of time,
  // because we require that the event owner must wait 7 days before withdrawing unclaimed deposits

  // Wait 10 years
  await network.provider.send('evm_increaseTime', [15778800000000]);

  txn = await rsvpContract.withdrawUnclaimedDeposits(eventID);
  wait = await txn.wait();
  console.log('WITHDRAWN:', wait?.events?.[0].event, wait?.events?.[0].args);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
