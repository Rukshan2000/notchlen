import React from 'react';

const AgreementForm = () => {
  return (
    <div>
    <h2 className="text-xl font-semibold mb-4">Payment Form</h2>
    <div className="mb-4">
      <label className="block font-medium mb-2">Payment Method</label>
      <select className="w-full border border-gray-300 p-2 rounded">
        <option>Card</option>
        <option>Bank Transfer</option>
      </select>
    </div>
    <div className="mb-4">
      <label className="block font-medium mb-2">Upload Payment Receipt</label>
      <input type="file" accept=".jpg,.png,.pdf" className="w-full p-2" />
    </div>
  </div>
  );
};

export default AgreementForm;
