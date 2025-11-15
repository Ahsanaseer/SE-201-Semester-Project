// Blood Request Management Module
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from './firebase-config.js';

/**
 * Create a new blood request
 */
export async function createRequest(requestData) {
    try {
        const docRef = await addDoc(collection(db, 'requests'), {
            requesterName: requestData.requesterName,
            bloodGroup: requestData.bloodGroup,
            contact: requestData.contact,
            department: requestData.department,
            reason: requestData.reason || '',
            timestamp: new Date().toISOString()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Get all blood requests
 */
export async function getAllRequests() {
    try {
        const querySnapshot = await getDocs(collection(db, 'allRequests'));
        const requests = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Map allRequests structure to expected format
            requests.push({ 
                id: doc.id,
                requesterName: data.fullName || data.userEmail || 'Unknown', // Use fullName if available, otherwise email
                bloodGroup: data.requestBlood || data.bloodGroup || '-',
                contact: data.contact || '-',
                department: data.department || '-',
                reason: data.reason || '-',
                timestamp: data.timestamp,
                status: data.status || 'pending', // Add status field
                userEmail: data.userEmail, // Keep original email for reference
                fullName: data.fullName || data.userEmail, // Keep fullName for reference
                requestedDonorId: data.requestedDonorId || null, // Store requested donor ID
                requestedDonorName: data.requestedDonorName || null // Store requested donor name
            });
        });
        return { success: true, requests: requests };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Update request status
 */
export async function updateRequestStatus(requestId, status) {
    try {
        await updateDoc(doc(db, 'allRequests', requestId), {
            status: status
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Delete a blood request
 */
export async function deleteRequest(requestId) {
    try {
        await deleteDoc(doc(db, 'allRequests', requestId));
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Create a blood request in allRequests collection
 */
export async function createBloodRequest(userEmail, requestBlood, fullName, requestedDonorId = null, requestedDonorName = null) {
    try {
        const docRef = await addDoc(collection(db, 'allRequests'), {
            userEmail: userEmail,
            requestBlood: requestBlood,
            fullName: fullName || userEmail, // Use fullName if provided, otherwise fallback to email
            requestedDonorId: requestedDonorId || null, // Store the specific donor ID that was requested
            requestedDonorName: requestedDonorName || null, // Store the donor name for reference
            timestamp: new Date().toISOString()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Get requests for a specific user by email
 */
export async function getUserRequests(userEmail) {
    try {
        const querySnapshot = await getDocs(collection(db, 'allRequests'));
        const requests = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Only include requests from this user
            if (data.userEmail === userEmail) {
                requests.push({ 
                    id: doc.id,
                    requesterName: data.fullName || data.userEmail || 'Unknown',
                    bloodGroup: data.requestBlood || data.bloodGroup || '-',
                    contact: data.contact || '-',
                    department: data.department || '-',
                    reason: data.reason || '-',
                    timestamp: data.timestamp,
                    status: data.status || 'pending',
                    userEmail: data.userEmail,
                    fullName: data.fullName || data.userEmail,
                    requestedDonorId: data.requestedDonorId || null,
                    requestedDonorName: data.requestedDonorName || null
                });
            }
        });
        // Sort by timestamp descending (most recent first)
        requests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return { success: true, requests: requests };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

