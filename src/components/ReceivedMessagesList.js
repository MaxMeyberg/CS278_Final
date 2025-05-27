import React, { useState } from "react";
import { ListObject, ViewAllObject } from "./TableComponents";

function ReceivedMessagesList({ messages = [], maxInitialDisplay = 1 }) {
  const [showMessagesModal, setShowMessagesModal] = useState(false);

  const columns = [
    { label: "From", className: "sender-col" },
    { label: "Amount ($)", className: "amount-col" },
    { label: "Message", className: "message-col" },
  ];

  const renderRow = (donation, idx) => (
    <div className="received-message-row" key={idx}>
      <div className="sender-col recipient-name">{donation.from}</div>
      <div className="amount-col">${donation.amount}</div>
      <div className="message-col">
        {donation.message ? (
          <span className="received-message-text">{donation.message}</span>
        ) : (
          <span className="no-message">—</span>
        )}
      </div>
    </div>
  );

  return (
    <>
      <ListObject
        title="Received Messages (Previous Round)"
        data={messages}
        columns={columns}
        renderRow={renderRow}
        maxInitialDisplay={maxInitialDisplay}
        onViewAll={() => setShowMessagesModal(true)}
        emptyMessage="No messages received last round."
        containerClassName="received-messages"
      />

      <ViewAllObject
        isOpen={showMessagesModal}
        onClose={() => setShowMessagesModal(false)}
        title="All Received Messages (Previous Round)"
        data={messages}
        columns={columns}
        renderRow={renderRow}
        modalClassName="received-messages-modal"
      />
    </>
  );
}

export default ReceivedMessagesList;
