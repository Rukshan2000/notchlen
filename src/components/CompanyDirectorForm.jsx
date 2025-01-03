import React, { useState } from 'react';

const CompanyDirectorForm = () => {
  const [nationality, setNationality] = useState('');

  const handleNationalityChange = (e) => {
    setNationality(e.target.value);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Company Director/s Appoint Form</h2>
      <div className="mb-4">
        <label className="block font-medium mb-2">Director Nationality</label>
        <div className="flex items-center mb-4">
          <input 
            type="radio" 
            id="sri-lankan" 
            name="nationality" 
            value="Sri Lankan" 
            className="mr-2" 
            onChange={handleNationalityChange} 
          />
          <label htmlFor="sri-lankan" className="mr-4">Sri Lankan</label>
          <input 
            type="radio" 
            id="non-sri-lankan" 
            name="nationality" 
            value="Non Sri Lankan" 
            className="mr-2" 
            onChange={handleNationalityChange} 
          />
          <label htmlFor="non-sri-lankan">Non Sri Lankan</label>
        </div>
      </div>

      {/* Sri Lankan Director View */}
      {nationality === 'Sri Lankan' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block font-medium mb-2">NIC No</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Title</label>
            <select className="w-full border border-gray-300 p-2 rounded">
              <option>Mr</option>
              <option>Mrs</option>
              <option>Miss</option>
              <option>Prof</option>
              <option>Dr</option>
              <option>Rev</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Full Name (According to NIC)</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Date of Birth</label>
            <input type="date" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Designation</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Province</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">District</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Divisional Secretariat Division</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Full Address</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Post Code/ZIP</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Residential Phone No.</label>
            <input type="tel" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Mobile Phone No.</label>
            <input type="tel" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Email Address</label>
            <input type="email" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Occupation</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Upload NIC Front Side</label>
            <input type="file" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Upload NIC Back Side</label>
            <input type="file" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Upload Signature Clear Image</label>
            <input type="file" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4 col-span-2">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Make this Director as a Shareholder
            </label>
          </div>
        </div>
      )}

      {/* Non-Sri Lankan Director View */}
      {nationality === 'Non Sri Lankan' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block font-medium mb-2">Passport No</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Passport Issued Country</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Title</label>
            <select className="w-full border border-gray-300 p-2 rounded">
              <option>Mr</option>
              <option>Mrs</option>
              <option>Miss</option>
              <option>Prof</option>
              <option>Dr</option>
              <option>Rev</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Full Name (According to Passport)</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Date of Birth</label>
            <input type="date" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Designation</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>

          {/* Local Address Section */}
          <h3 className="text-lg font-semibold mt-6 mb-2 col-span-2">Local Address</h3>
          <div className="mb-4">
            <label className="block font-medium mb-2">Province</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">District</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Divisional Secretariat Division</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Full Address</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Post Code/ZIP</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Residential Phone No.</label>
            <input type="tel" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Mobile Phone No.</label>
            <input type="tel" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Email Address</label>
            <input type="email" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Occupation</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Upload Passport</label>
            <input type="file" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Upload Signature Clear Image</label>
            <input type="file" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4 col-span-2">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Make this Director as a Shareholder
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDirectorForm;
