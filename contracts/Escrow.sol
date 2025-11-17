//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address public nftAddress;
    address payable public seller;
    address public lender;

    mapping(uint => bool) public isListed;
    mapping(uint => uint) public purchaseAmount;
    mapping(uint => uint) public escrowAmount;
    mapping(uint => address) public buyer;

    constructor(address _nftAddress, address _seller, address _lender) {
        nftAddress = _nftAddress;
        seller = payable(_seller);
        lender = _lender;
    }

    modifier onlyBuyer(uint _nftId) {
        require(
            msg.sender == buyer[_nftId],
            "Only buyer is allowed to do this action"
        );
        _;
    }

    function listProperty(
        uint _nftId,
        address _buyer,
        uint _purchaseAmount,
        uint _escrowAmount
    ) public {
        // transfer the ownership to contract
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftId);

        isListed[_nftId] = true;
        buyer[_nftId] = _buyer;
        purchaseAmount[_nftId] = _purchaseAmount;
        escrowAmount[_nftId] = _escrowAmount;
    }

    // buyer will pay the earnest deposit
    function depositEarnest(uint _nftId) public payable {
        require(msg.value >= escrowAmount[_nftId]);
    }

    function finalizeSale(uint _nftId) public {
        // validate that contract recieve the sufficient ethers
        require(address(this).balance >= purchaseAmount[_nftId]);

        // send purchase price ethers to seller
        (bool success, ) = payable(seller).call{value: address(this).balance}(
            ""
        );

        require(success, "Failed to finalize the sale");

        // transfer the ownership to buyer
        IERC721(nftAddress).transferFrom(address(this), buyer[_nftId], _nftId);
    }

    receive() external payable {}

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}




  // 🔹 Load blockchain connection when component mounts
//   useEffect(() => {
//     const loadBlockchain = async () => {
//       if (window.ethereum) {
//         const webProvider = new ethers.providers.Web3Provider(window.ethereum);
//         setProvider(webProvider);

//         // Listen for account changes
//         window.ethereum.on("accountsChanged", (accounts) => {
//           if (accounts.length > 0) {
//             setAccount(ethers.utils.getAddress(accounts[0]));
//             console.log("Account changed:", accounts[0]);
//           } else {
//             setAccount(null);
//           }
//         });

//         // Listen for network changes
//         window.ethereum.on("chainChanged", () => {
//           window.location.reload();
//         });
//       } else {
//         alert("MetaMask not detected. Please install it to use this app.");
//       }
//     };

//     loadBlockchain();

//     // ✅ Cleanup listeners on unmount
//     return () => {
//       if (window.ethereum?.removeListener) {
//         window.ethereum.removeListener("accountsChanged", () => {});
//         window.ethereum.removeListener("chainChanged", () => {});
//       }
//     };
//   }, []);

//   // 🔹 Connect wallet manually
//   const connectWallet = async () => {
//     if (!window.ethereum) {
//       alert("Please install MetaMask to use this dApp!");
//       return;
//     }

//     try {
//       const webProvider = new ethers.providers.Web3Provider(window.ethereum);
//       const accounts = await webProvider.send("eth_requestAccounts", []);
//       const network = await webProvider.getNetwork();

//       const realEstate = new ethers.Contract(
//         realEstateAddress,
//         RealEstate,
//         webProvider
//       );

//       const properties = [];

//       for (let i=0; i < 3; i++) {
//         const uri = await realEstate.tokenURI(i);
//         const result = await fetch(uri);
//         const metadata = await result.json();
//         properties.push(metadata);
//       }

//       const escrow = new ethers.Contract(escrowAddress, Escrow, webProvider);

//       setProvider(webProvider);
//       setAccount(ethers.utils.getAddress(accounts[0]));

//       console.log("Connected account:", accounts[0]);
//       console.log("Connected network:", network);
//     } catch (err) {
//       console.error("Wallet connection failed:", err);
//     }
//   };