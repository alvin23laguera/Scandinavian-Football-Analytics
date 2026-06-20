export const processEventsToCSV = (events) => {
    if (!events || events.length === 0) {
        throw new Error("No events provided to process.");
    }
    
    // 3. Find all unique qualifier IDs to create separate columns
    const allQualifierIds = new Set();
    events.forEach(event => {
        if (event.qualifier) {
            event.qualifier.forEach(q => allQualifierIds.add(q.qualifierId));
        }
    });
    const sortedQualifiers = Array.from(allQualifierIds).sort((a, b) => a - b);
    
    // 4. Define standard columns + dynamic qualifier columns
    const headers = [
        "id", "eventId", "typeId", "periodId", "timeMin", "timeSec", 
        "contestantId", "playerId", "playerName", "outcome", "keyPass",
        "x", "y", "timeStamp", "lastModified"
    ];
    sortedQualifiers.forEach(qId => headers.push(`qualifier_${qId}`));
    
    const csvRows = [];
    csvRows.push(headers.join(","));
    
    // 5. Map each event to a CSV row
    events.forEach(event => {
        // Make sure names containing commas are escaped
        const safePlayerName = event.playerName 
            ? `"${event.playerName.replace(/"/g, '""')}"` 
            : "";
            
        // Build a quick lookup for this event's qualifiers
        const qualifierMap = {};
        if (event.qualifier) {
            event.qualifier.forEach(q => {
                // If a qualifier lacks a value, treat it as true/present
                qualifierMap[q.qualifierId] = q.value !== undefined ? q.value : "true";
            });
        }
        
        // Map dynamic qualifier values
        const qualifierColumns = sortedQualifiers.map(qId => {
            let val = qualifierMap[qId];
            if (val === undefined) return "";
            val = String(val);
            if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
        });
        
        const row = [
            event.id !== undefined ? event.id : "",
            event.eventId !== undefined ? event.eventId : "",
            event.typeId !== undefined ? event.typeId : "",
            event.periodId !== undefined ? event.periodId : "",
            event.timeMin !== undefined ? event.timeMin : "",
            event.timeSec !== undefined ? event.timeSec : "",
            event.contestantId || "",
            event.playerId || "",
            safePlayerName,
            event.outcome !== undefined ? event.outcome : "",
            event.keyPass !== undefined ? event.keyPass : "",
            event.x !== undefined ? event.x : "",
            event.y !== undefined ? event.y : "",
            event.timeStamp !== undefined ? event.timeStamp : "",
            event.lastModified !== undefined ? event.lastModified : ""
        ];
        
        // Combine standard row with qualifier columns
        row.push(...qualifierColumns);
        
        // Join with commas
        csvRows.push(row.join(","));
    });
    
    return csvRows.join("\n");
};

export const processOptaToCSV = (fileText) => {
    let jsonStr = fileText.trim();
    const startIndex = jsonStr.indexOf('{');
    const endIndex = jsonStr.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
        throw new Error("Invalid format: Could not find valid JSON payload inside file.");
    }
    
    jsonStr = jsonStr.substring(startIndex, endIndex + 1);
    let data;
    try {
        data = JSON.parse(jsonStr);
    } catch (e) {
        throw new Error("Invalid format: Failed to parse JSON object.");
    }
    
    if (!data.liveData || !data.liveData.event) {
        throw new Error("No liveData.event found. Is this an Opta F24 Match Event file?");
    }
    
    const events = data.liveData.event;
    if (events.length === 0) {
        throw new Error("File parsed successfully, but zero match events were found.");
    }
    
    return processEventsToCSV(events);
};

export const downloadCSV = (csvContent, fileName) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    
    // Append to body momentarily for Firefox compatibility
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
};
