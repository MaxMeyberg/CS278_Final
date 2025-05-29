import React from "react";

// Unified DataTable component for rendering table structure
export const DataTable = ({
  columns,
  data,
  renderRow,
  className = "",
  style = {},
}) => (
  <div className={`received-messages-table ${className}`} style={style}>
    <div className="received-messages-header">
      {columns.map((col, idx) => (
        <div key={idx} className={col.className}>
          {col.label}
        </div>
      ))}
    </div>
    <div className="received-messages-rows">
      {data.map((item, idx) => renderRow(item, idx))}
    </div>
  </div>
);

// Modal component for "View All" functionality
// Both received messages and donation modals use identical styling
// The only difference is the content (static text vs input fields)
export const ViewAllObject = ({
  isOpen,
  onClose,
  title,
  data,
  columns,
  renderRow,
  modalClassName = "",
  balanceInfo = null, // Optional balance information for donation modals
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-content ${modalClassName}`}>
        <button
          className="modal-close-btn"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close modal"
        >
          &times;
        </button>
        <h2>{title}</h2>

        {/* Balance Information Section - Only for donation modals */}
        {balanceInfo && (
          <div className="modal-balance-info">
            <div className="balance-item">
              <span className="balance-label">Your Balance:</span>
              <span className="balance-value">${balanceInfo.maxAmount}</span>
            </div>
            <div className="balance-item">
              <span className="balance-label">Total Donations:</span>
              <span className="balance-value">
                ${balanceInfo.totalDonations}
              </span>
            </div>
            <div className="balance-item">
              <span className="balance-label">Remaining:</span>
              <span
                className={`balance-value ${
                  balanceInfo.remainingBalance < 0 ? "negative" : ""
                }`}
              >
                ${balanceInfo.remainingBalance}
              </span>
            </div>
          </div>
        )}

        <DataTable
          columns={columns}
          data={data}
          renderRow={renderRow}
          style={{ padding: "12px" }}
        />
      </div>
    </div>
  );
};

// Main list component with header, table, and "View All" button
export const ListObject = ({
  title,
  data,
  columns,
  renderRow,
  maxInitialDisplay = 1,
  onViewAll,
  emptyMessage,
  headerStyle = {},
  containerClassName = "",
  showViewAll = true,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={containerClassName}>
        <h4 className="transaction-list-header">{title}</h4>
        <p className="received-message-empty">
          {emptyMessage || "No items to display."}
        </p>
      </div>
    );
  }

  const initialDataToDisplay = data.slice(0, maxInitialDisplay);

  return (
    <div className={containerClassName}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          ...headerStyle,
        }}
      >
        <h4 className="transaction-list-header">{title}</h4>
        {/* Temporarily commented out View All button */}
        {/* {showViewAll && (
          <button className="button-link" onClick={onViewAll}>
            View All ({data.length})
          </button>
        )} */}
      </div>

      <DataTable
        columns={columns}
        data={initialDataToDisplay}
        renderRow={renderRow}
        style={{ padding: "0" }}
      />
    </div>
  );
};
