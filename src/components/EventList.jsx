import React, { useState } from 'react';

const PaginatedForm = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, 6));
  const handlePrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));


    const [nationality, setNationality] = useState('');
  
    const handleNationalityChange = (e) => {
      setNationality(e.target.value);
    };

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      {currentPage === 1 && (
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
      )}

      {currentPage === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Contact Person Form</h2>
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
            <label className="block font-medium mb-2">Name</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Email Address</label>
            <input type="email" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Phone Number</label>
            <input type="tel" className="w-full border border-gray-300 p-2 rounded" />
          </div>
        </div>
      )}

      {currentPage === 3 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Company Information</h2>
          <div className="mb-4">
            <label className="block font-medium mb-2">Company Name</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Company Logo Upload</label>
            <input type="file" className="w-full p-2" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Company Type</label>
            <select className="w-full border border-gray-300 p-2 rounded">
              <option>(Pvt) Ltd</option>
              <option>(Private) Limited</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Company Address</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block font-medium mb-2">Province</label>
              <input type="text" className="w-full border border-gray-300 p-2 rounded" />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-2">District</label>
              <input type="text" className="w-full border border-gray-300 p-2 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block font-medium mb-2">Divisional Secretariat Division</label>
              <input type="text" className="w-full border border-gray-300 p-2 rounded" />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-2">Grama Niladhari Division</label>
              <input type="text" className="w-full border border-gray-300 p-2 rounded" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Postal Code</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Company Email</label>
            <input type="email" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Company Objectives</label>
            <textarea className="w-full border border-gray-300 p-2 rounded"></textarea>
          </div>
        </div>
      )}

      {currentPage === 4 && (
 <div>
 <h2 className="text-xl font-semibold mb-4">Company Director/s Appoint Form</h2>
 <div className="mb-4">
   <label className="block font-medium mb-2">Director Nationality</label>
   <div className="flex items-center">
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
        <div>
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
          <div className="mb-4">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Make this Director as a Shareholder
            </label>
          </div>
        </div>
      )}

 {/* Non-Sri Lankan Director View */}
 {nationality === 'Non Sri Lankan' && (
            <div>
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
          <h3 className="text-lg font-semibold mt-6 mb-2">Local Address</h3>
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

          {/* Foreign Address Section */}
          <h3 className="text-lg font-semibold mt-6 mb-2">Foreign Address</h3>
          <div className="mb-4">
            <label className="block font-medium mb-2">Full Address</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">City</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">State/Region/Province</label>
            <input type="text" className="w-full border border-gray-300 p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Postal/ZIP code</label>
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
          <div className="mb-4">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Make this Director as a Shareholder
            </label>
          </div>
        </div>
      
 )}
</div>
      )}

      {currentPage === 5 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Agreement Section</h2>
          <p className="mb-4">Please read and agree to the terms and conditions.</p>
          <div className="flex items-center mb-4">
            <input type="checkbox" id="agree" className="mr-2" />
            <label htmlFor="agree">I agree to the terms and conditions</label>
          </div>
        </div>
      )}

      {currentPage === 6 && (
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
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`px-4 py-2 font-semibold bg-gray-200 rounded ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentPage === 6}
          className={`px-4 py-2 font-semibold bg-blue-500 text-white rounded ${currentPage === 6 ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PaginatedForm;
