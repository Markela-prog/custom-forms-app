const SalesforceButton = () => {
    return (
      <button
        onClick={() => (window.location.href = "https://custom-forms-app-r0hw.onrender.com/api/salesforce")}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Connect to Salesforce
      </button>
    );
  };
  
  export default SalesforceButton;
  