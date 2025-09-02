import React, { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  FileText 
} from 'lucide-react';

const NotesTab = ({ job, onUpdate }) => {
  const [newNote, setNewNote] = useState('');
  const [newNoteType, setNewNoteType] = useState('internal');
  
  // Build note history from existing job notes
  const [noteHistory, setNoteHistory] = useState(() => {
    const notes = [];
    if (job.customerNotes) {
      notes.push({
        id: 1,
        type: 'customer',
        content: job.customerNotes,
        author: 'System',
        timestamp: job.createdAt,
        edited: false
      });
    }
    if (job.internalNotes) {
      notes.push({
        id: 2,
        type: 'internal',
        content: job.internalNotes,
        author: 'Admin User',
        timestamp: job.createdAt,
        edited: false
      });
    }
    return notes;
  });

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    const note = {
      id: Date.now(),
      type: newNoteType,
      content: newNote,
      author: 'Admin User',
      timestamp: new Date().toISOString(),
      edited: false
    };
    
    setNoteHistory([...noteHistory, note]);
    setNewNote('');

    // Also update the main job notes field
    try {
      const updateField = newNoteType === 'customer' ? 'customerNotes' : 'internalNotes';
      const currentNote = newNoteType === 'customer' ? job.customerNotes : job.internalNotes;
      const updatedNote = currentNote ? `${currentNote}\n\n${newNote}` : newNote;
      
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [updateField]: updatedNote })
      });

      if (response.ok && onUpdate) {
        const updatedJob = await response.json();
        onUpdate(updatedJob);
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Add New Note */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Note</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="internal"
                checked={newNoteType === 'internal'}
                onChange={(e) => setNewNoteType(e.target.value)}
                className="text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Internal Note</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="customer"
                checked={newNoteType === 'customer'}
                onChange={(e) => setNewNoteType(e.target.value)}
                className="text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Customer Note</span>
            </label>
          </div>
          
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            placeholder={`Enter ${newNoteType} note...`}
          />
          
          <button
            onClick={handleAddNote}
            disabled={!newNote.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Note
          </button>
        </div>
      </div>

      {/* Notes History */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes History</h3>
        
        {noteHistory.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No notes added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {noteHistory
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map((note) => (
                <div
                  key={note.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    note.type === 'customer'
                      ? 'bg-blue-50 border-l-blue-500'
                      : 'bg-gray-50 border-l-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        note.type === 'customer'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {note.type === 'customer' ? 'Customer' : 'Internal'}
                      </span>
                      <span className="text-sm text-gray-600">by {note.author}</span>
                      {note.edited && (
                        <span className="text-xs text-gray-500">(edited)</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatTimestamp(note.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-900">{note.content}</p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesTab;