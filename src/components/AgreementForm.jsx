import React from 'react';

const AgreementForm = () => {
  return (
    <div>
    <h2 className="text-xl font-semibold mb-4">Agreement Section</h2>
    <p className="mb-4">Please read and agree to the terms and conditions.</p>
    <div className="flex items-center mb-4">
      <input type="checkbox" id="agree" className="mr-2" />
      <label htmlFor="agree">I agree to the terms and conditions</label>
    </div>
  </div>
  );
};

export default AgreementForm;
