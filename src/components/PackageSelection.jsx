import React from 'react';

const PackageSelection = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Package Selection</h2>
      <div className="mb-4">
        <label className="block font-medium mb-2">Select a Package</label>
        <div className="flex items-center">
          <input type="radio" id="silver" name="package" value="Silver" className="mr-2" />
          <label htmlFor="silver" className="mr-6">Silver Package</label>
          <input type="radio" id="premium" name="package" value="Premium" className="mr-2" />
          <label htmlFor="premium">Premium Package</label>
        </div>
      </div>
    </div>
  );
};

export default PackageSelection;
