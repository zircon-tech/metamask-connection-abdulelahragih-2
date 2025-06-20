// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DecentralizedWill {
    struct Will {
        uint256 willId;
        address beneficiary;
        uint lastCheckIn;
        uint inactivityPeriod;
        uint amount;
        bool claimed;
    }

    // mappings from the Will owner to array of wills
    mapping(address => Will[]) public ownerWills;
    
    // Counter to generate unique will IDs
    uint256 private nextWillId = 1;
    
    // Events
    event WillCreated(address indexed owner, uint256 willId, address indexed beneficiary, uint256 amount);
    event WillClaimed(address indexed owner, uint256 willId, address indexed beneficiary, uint256 amount);
    event HeartbeatSent(address indexed owner, uint256 willId);

    // Set or update a will (creates a new will entry)
    function setWill(address beneficiary, uint inactivityPeriod) external payable {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(msg.value > 1, "Must send ETH");

        Will memory newWill = Will({
            willId: nextWillId,
            beneficiary: beneficiary,
            inactivityPeriod: inactivityPeriod,
            lastCheckIn: block.timestamp,
            amount: msg.value,
            claimed: false
        });

        ownerWills[msg.sender].push(newWill);
        
        emit WillCreated(msg.sender, nextWillId, beneficiary, msg.value);
        nextWillId++;
    }

    // Send a heartbeat to keep your will alive
    function heartbeat(uint256 willId) external {
        Will[] storage wills = ownerWills[msg.sender];
        require(wills.length > 0, "No wills exist for sender");
        
        bool found = false;
        for (uint i = 0; i < wills.length; i++) {
            if (wills[i].willId == willId && !wills[i].claimed) {
                wills[i].lastCheckIn = block.timestamp;
                found = true;
                emit HeartbeatSent(msg.sender, willId);
                break;
            }
        }
        
        require(found, "Will not found or already claimed");
    }

    // Claim inheritance if owner is inactive
    function claim(address owner, uint256 willId) external {
        Will[] storage wills = ownerWills[owner];
        require(wills.length > 0, "No wills exist for owner");

        bool found = false;
        for (uint i = 0; i < wills.length; i++) {
            if (wills[i].willId == willId) {
                Will storage will = wills[i];
                require(!will.claimed, "Already claimed");
                require(will.beneficiary != address(0), "No will set");
                require(msg.sender == will.beneficiary, "You are not the beneficiary");
                require(block.timestamp >= will.lastCheckIn + will.inactivityPeriod, "Owner is still active");

                uint amount = will.amount;

                (bool success, ) = payable(will.beneficiary).call{value: amount}("");
                require(success, "Transfer failed");

                // Only update state after successful transfer
                will.claimed = true;
                will.amount = 0;
                
                emit WillClaimed(owner, willId, will.beneficiary, amount);
                found = true;
                break;
            }
        }
        
        require(found, "Will not found");
    }

    function isClaimable(address _owner, uint256 willId) external view returns (bool) {
        Will[] storage wills = ownerWills[_owner];
        
        for (uint i = 0; i < wills.length; i++) {
            if (wills[i].willId == willId) {
                Will storage will = wills[i];
                return (
                    !will.claimed &&
                    will.beneficiary != address(0) &&
                    block.timestamp >= will.lastCheckIn + will.inactivityPeriod
                );
            }
        }
        
        return false;
    }

    // Allow owners to send more ETH to their will after setup
    receive() external payable {
        revert("Use addToWill function to add funds to a specific will");
    }

    // Add funds to a specific will
    function addToWill(uint256 willId) external payable {
        require(msg.value > 0, "Must send ETH");
        
        Will[] storage wills = ownerWills[msg.sender];
        require(wills.length > 0, "No wills exist");

        bool found = false;
        for (uint i = 0; i < wills.length; i++) {
            if (wills[i].willId == willId && !wills[i].claimed) {
                wills[i].amount += msg.value;
                found = true;
                break;
            }
        }
        
        require(found, "Will not found or already claimed");
    }

    // Get details of a specific will
    function getWillDetails(address _owner, uint256 willId) external view returns (address beneficiary, uint lastCheckIn, uint inactivityPeriod, uint amount, bool claimed) {
        Will[] storage wills = ownerWills[_owner];
        
        for (uint i = 0; i < wills.length; i++) {
            if (wills[i].willId == willId) {
                Will storage will = wills[i];
                return (will.beneficiary, will.lastCheckIn, will.inactivityPeriod, will.amount, will.claimed);
            }
        }
        
        revert("Will not found");
    }

    function getAllWills(address _owner) external view returns (Will[] memory) {
        return ownerWills[_owner];
    }

    function getWillCount(address _owner) external view returns (uint256) {
        return ownerWills[_owner].length;
    }

    function getWillByIndex(address _owner, uint256 index) external view returns (Will memory) {
        require(index < ownerWills[_owner].length, "Index out of bounds");
        return ownerWills[_owner][index];
    }
}