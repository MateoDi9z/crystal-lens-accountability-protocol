export const governanceAbi = [
	{
		"type": "constructor",
		"inputs": [
			{
				"name": "_treasury",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "_owner",
				"type": "address",
				"internalType": "address"
			}
		],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "createProposal",
		"inputs": [
			{
				"name": "_description",
				"type": "string",
				"internalType": "string"
			},
			{
				"name": "_amount",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "executeProposal",
		"inputs": [
			{
				"name": "_id",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "getProposal",
		"inputs": [
			{
				"name": "_id",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "tuple",
				"internalType": "struct Governance.Proposal",
				"components": [
					{
						"name": "id",
						"type": "uint256",
						"internalType": "uint256"
					},
					{
						"name": "proposer",
						"type": "address",
						"internalType": "address"
					},
					{
						"name": "description",
						"type": "string",
						"internalType": "string"
					},
					{
						"name": "amount",
						"type": "uint256",
						"internalType": "uint256"
					},
					{
						"name": "forVotes",
						"type": "uint256",
						"internalType": "uint256"
					},
					{
						"name": "againstVotes",
						"type": "uint256",
						"internalType": "uint256"
					},
					{
						"name": "state",
						"type": "uint8",
						"internalType": "enum Governance.ProposalState"
					}
				]
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "isApproved",
		"inputs": [
			{
				"name": "_id",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "bool",
				"internalType": "bool"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "isExecuted",
		"inputs": [
			{
				"name": "_id",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "bool",
				"internalType": "bool"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "isPending",
		"inputs": [
			{
				"name": "_id",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "bool",
				"internalType": "bool"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "owner",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "address",
				"internalType": "address"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "proposalCount",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "proposals",
		"inputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [
			{
				"name": "id",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "proposer",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "description",
				"type": "string",
				"internalType": "string"
			},
			{
				"name": "amount",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "forVotes",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "againstVotes",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "state",
				"type": "uint8",
				"internalType": "enum Governance.ProposalState"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "renounceOwnership",
		"inputs": [],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "transferOwnership",
		"inputs": [
			{
				"name": "newOwner",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "treasury",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "address",
				"internalType": "contract ITreasury"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "vote",
		"inputs": [
			{
				"name": "_id",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "_support",
				"type": "bool",
				"internalType": "bool"
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "voted",
		"inputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "bool",
				"internalType": "bool"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "event",
		"name": "OwnershipTransferred",
		"inputs": [
			{
				"name": "previousOwner",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "newOwner",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "ProposalApproved",
		"inputs": [
			{
				"name": "id",
				"type": "uint256",
				"indexed": true,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "ProposalCreated",
		"inputs": [
			{
				"name": "id",
				"type": "uint256",
				"indexed": true,
				"internalType": "uint256"
			},
			{
				"name": "proposer",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "description",
				"type": "string",
				"indexed": false,
				"internalType": "string"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "ProposalExecuted",
		"inputs": [
			{
				"name": "id",
				"type": "uint256",
				"indexed": true,
				"internalType": "uint256"
			},
			{
				"name": "recipient",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "amount",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "ProposalRejected",
		"inputs": [
			{
				"name": "id",
				"type": "uint256",
				"indexed": true,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "Voted",
		"inputs": [
			{
				"name": "proposalId",
				"type": "uint256",
				"indexed": true,
				"internalType": "uint256"
			},
			{
				"name": "voter",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "support",
				"type": "bool",
				"indexed": false,
				"internalType": "bool"
			}
		],
		"anonymous": false
	},
	{
		"type": "error",
		"name": "OwnableInvalidOwner",
		"inputs": [
			{
				"name": "owner",
				"type": "address",
				"internalType": "address"
			}
		]
	},
	{
		"type": "error",
		"name": "OwnableUnauthorizedAccount",
		"inputs": [
			{
				"name": "account",
				"type": "address",
				"internalType": "address"
			}
		]
	}
] as const;
