import React, { useState } from "react";
import { ListObject, ViewAllObject } from "./TableComponents";

function DonationRecipientsList({
  recipients = [],
  currentDonations = {},
  handleDonationChange,
  maxInitialDisplay = 1,
  maxAmount = 0,
  isFirstRound = false,
}) {
  const [showRecipientsModal, setShowRecipientsModal] = useState(false);

  // Calculate total donations
  const totalDonations = Object.values(currentDonations).reduce(
    (sum, donation) => sum + (Number(donation.amount) || 0),
    0
  );

  // Check if over limit
  const isOverLimit = totalDonations > maxAmount;
  const remainingBalance = maxAmount - totalDonations;

  const columns = [
    { label: "Recipient", className: "sender-col" },
    { label: "Amount", className: "amount-col" },
    { label: "Message", className: "message-col" },
  ];

  const renderRow = (player, idx) => {
    const playerDonation = currentDonations[player.name]?.amount || 0;
    const hasError = Number(playerDonation) > 0 && isOverLimit;

    return (
      <div className="received-message-row" key={idx}>
        <div className="sender-col">
          <span className="recipient-name">{player.name}</span>
        </div>
        <div className="amount-col">
          <input
            type="number"
            min="0"
            max={maxAmount}
            value={currentDonations[player.name]?.amount || ""}
            onChange={(e) => handleDonationChange(player.name, e.target.value)}
            className={`donation-input amount-input ${hasError ? "error" : ""}`}
            placeholder="$0"
          />
        </div>
        <div className="message-col">
          <input
            type="text"
            value={currentDonations[player.name]?.message || ""}
            onChange={(e) =>
              handleDonationChange(
                player.name,
                currentDonations[player.name]?.amount || 0,
                e.target.value
              )
            }
            className="donation-input message-input"
            placeholder="Add a message..."
            maxLength={50}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`donation-interface${isFirstRound ? " first-round" : ""}`}>
      <ListObject
        title="Donate to Others (Gets Tripled!)"
        data={recipients}
        columns={columns}
        renderRow={renderRow}
        maxInitialDisplay={maxInitialDisplay}
        onViewAll={() => setShowRecipientsModal(true)}
        emptyMessage="No other players have joined yet. Donation options will appear once more players join the game."
        containerClassName=""
      />

      <ViewAllObject
        isOpen={showRecipientsModal}
        onClose={() => setShowRecipientsModal(false)}
        title="All Recipients - Donate to Others"
        data={recipients}
        columns={columns}
        renderRow={renderRow}
        modalClassName="donation-recipients-modal"
        balanceInfo={{
          maxAmount,
          totalDonations,
          remainingBalance,
        }}
      />
    </div>
  );
}

export default DonationRecipientsList;
