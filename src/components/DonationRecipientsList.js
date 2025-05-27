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

  // Simple profanity filter
  const filterProfanity = (text) => {
    const badWords = [
      "fuck",
      "shit",
      "damn",
      "hell",
      "ass",
      "bitch",
      "bastard",
      "crap",
      "piss",
      "dick",
      "cock",
      "pussy",
      "whore",
      "slut",
      "fag",
      "nigger",
      "retard",
      "gay",
      "stupid",
      "idiot",
      "moron",
      "dumb",
      "kill",
      "die",
      "hate",
      "suck",
      "loser",
      "ugly",
      "fat",
      "dumbass",
      "asshole",
    ];

    let filtered = text;
    badWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      filtered = filtered.replace(regex, "*".repeat(word.length));
    });
    return filtered;
  };

  const renderRow = (player, idx) => {
    const playerDonation = currentDonations[player.name]?.amount || 0;
    const hasError = Number(playerDonation) > 0 && isOverLimit;
    const isAmountNonZero = playerDonation > 0;

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
            step="1"
            value={currentDonations[player.name]?.amount || ""}
            onChange={(e) => handleDonationChange(player.name, e.target.value)}
            onKeyDown={(e) => {
              // Allow only numbers and basic editing keys
              const allowedKeys = [
                "Backspace",
                "Delete",
                "Tab",
                "Enter",
                "ArrowLeft",
                "ArrowRight",
              ];
              const isNumber = e.key >= "0" && e.key <= "9";
              const isCtrlCmd = e.ctrlKey || e.metaKey;

              if (!isNumber && !allowedKeys.includes(e.key) && !isCtrlCmd) {
                e.preventDefault();
              }
            }}
            className={`donation-input amount-input ${hasError ? "error" : ""}`}
            placeholder="$0"
          />
        </div>
        <div className="message-col">
          <input
            type="text"
            value={
              playerDonation === 0
                ? ""
                : currentDonations[player.name]?.message || ""
            }
            onChange={(e) => {
              if (playerDonation === 0) return;
              const filteredMessage = filterProfanity(e.target.value);
              handleDonationChange(
                player.name,
                playerDonation,
                filteredMessage
              );
            }}
            onKeyDown={(e) => {
              // Block ALL input when amount is 0
              if (playerDonation === 0) {
                e.preventDefault();
                return;
              }
            }}
            disabled={playerDonation === 0}
            className={`donation-input message-input ${
              playerDonation === 0 ? "readonly-style" : ""
            }`}
            placeholder={
              playerDonation === 0 ? "Enter donation amount first!" : ""
            }
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
