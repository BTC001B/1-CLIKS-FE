const getBaseUrl = () => import.meta.env.VITE_CALCULATOR_API_BASE_URL || 'https://api.bit-tool.com/api/calculator';

const getHeaders = () => {
    const token = localStorage.getItem('bnx_auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const calculatorService = {
  // Tape Calculator History
  getHistory: async () => {
    const res = await fetch(`${getBaseUrl()}/history`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  // Tape Calculator Save Session & Items
  saveHistory: async (tapeArray) => {
    // 1. Create parent session
    const sessionRes = await fetch(`${getBaseUrl()}/sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ 
        title: `Tape - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        mode: "business",
        currency: "INR" 
      })
    });
    
    if (!sessionRes.ok) throw new Error('Failed to create session');
    const sessionData = await sessionRes.json();
    const sessionId = sessionData.id || sessionData._id;

    // 2. Add each item sequentially
    let sequence = 1;
    for (const item of tapeArray) {
      const itemRes = await fetch(`${getBaseUrl()}/sessions/${sessionId}/items`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          sequence: sequence++,
          value: Number(item.value || 0),
          operator: item.type === 'base' ? '=' : item.type,
          runningTotal: Number(item.runningAfter || item.value || 0),
          label: item.label || ''
        })
      });
      if (!itemRes.ok) {
        console.error('Failed to save tape item', item);
      }
    }
    return true;
  },

  deleteHistoryItem: async (id) => {
    const res = await fetch(`${getBaseUrl()}/sessions/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete session');
    return res.json();
  },

  clearHistory: async () => {
    const res = await fetch(`${getBaseUrl()}/history`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to clear history');
    return res.json();
  },

  // Compare Mode History
  getCompareHistory: async () => {
    const res = await fetch(`${getBaseUrl()}/compare/history`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch compare history');
    return res.json();
  },

  // Compare Mode Save Session & Items
  saveCompareHistory: async (compareData) => {
    // compareData format: { leftEntries, rightEntries }
    // We assume they match up line-by-line (or we merge them by index)
    const sessionRes = await fetch(`${getBaseUrl()}/compare/sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ 
        title: `Vendor Comparison - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      })
    });

    if (!sessionRes.ok) throw new Error('Failed to create compare session');
    const sessionData = await sessionRes.json();
    const sessionId = sessionData.id || sessionData._id;

    const maxLength = Math.max(compareData.leftEntries.length, compareData.rightEntries.length);
    
    for (let i = 0; i < maxLength; i++) {
      const leftEntry = compareData.leftEntries[i] || { val: 0, label: '' };
      const rightEntry = compareData.rightEntries[i] || { val: 0, label: '' };

      const itemRes = await fetch(`${getBaseUrl()}/compare/sessions/${sessionId}/items`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          sequence: i + 1,
          label: leftEntry.label || rightEntry.label || `Item ${i + 1}`,
          vendorA_Value: Number(leftEntry.val || 0),
          vendorB_Value: Number(rightEntry.val || 0)
        })
      });
      if (!itemRes.ok) {
        console.error('Failed to save compare item');
      }
    }
    return true;
  }
};

export default calculatorService;
