"use client";
import React, { useState } from 'react';
import { migrateLocalStorageToDatabase, showMigrationResults, hasLocalStorageData } from '@/utils/migrate-localStorage-to-database';
import { enhancedMigration, debugLocalStorage } from '@/utils/enhanced-migration';
import { diagnoseOutstandingPlacements, testOutstandingPlacementsMigration } from '@/utils/diagnose-outstanding-placements';
import { fixOutstandingPlacementsMigration, debugPlacementsSize } from '@/utils/fix-outstanding-placements';
import { debugMigrationErrors, debugDataStructures } from '@/utils/debug-migration-errors';
import { safeFullMigration } from '@/utils/safe-migration';
import { fixedFullMigration, inspectLocalStorageData, testEndpoint } from '@/utils/fixed-migration';
import { BASE_URL } from '../utils/baseUrl';
import apiFetch from '@/utils/apiFetch';

export default function DataMigration() {
  const [isRunning, setIsRunning] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [migrationResults, setMigrationResults] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  React.useEffect(() => {
    // Check if there's localStorage data to migrate
    setHasData(hasLocalStorageData());
  }, []);

  const runMigration = async () => {
    setIsRunning(true);
    try {
      const results = await migrateLocalStorageToDatabase();
      setMigrationResults(results);
      showMigrationResults(results);
      
      // Recheck if there's still data after migration
      setHasData(hasLocalStorageData());
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runEnhancedMigration = async () => {
    setIsRunning(true);
    try {
      const results = await enhancedMigration();
      setMigrationResults(results);
      
      // Recheck if there's still data after migration
      setHasData(hasLocalStorageData());
    } catch (error) {
      console.error('Enhanced migration failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runDebug = () => {
    debugLocalStorage();
    setShowDebug(true);
  };

  const diagnoseOutstanding = () => {
    diagnoseOutstandingPlacements();
    setShowDebug(true);
  };

  const testOutstandingMigration = async () => {
    setIsRunning(true);
    try {
      const result = await testOutstandingPlacementsMigration();
      setMigrationResults({ outstandingPlacements: result });
      setHasData(hasLocalStorageData());
    } catch (error) {
      console.error('Outstanding Placements test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const fixOutstandingPlacements = async () => {
    setIsRunning(true);
    try {
      const result = await fixOutstandingPlacementsMigration();
      setMigrationResults({ outstandingPlacements: result });
      setHasData(hasLocalStorageData());
    } catch (error) {
      console.error('Outstanding Placements fix failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const debugSize = () => {
    debugPlacementsSize();
    setShowDebug(true);
  };

  const debugErrors = async () => {
    setIsRunning(true);
    try {
      const errors = await debugMigrationErrors();
      console.log('Migration errors:', errors);
      if (errors.length > 0) {
        setMigrationResults(Object.fromEntries(
          errors.map(error => [error.endpoint.replace('/', ''), {
            success: false,
            message: `Error ${error.statusCode}: ${error.error}`,
            data: error.data
          }])
        ));
      } else {
        setMigrationResults({ debug: { success: true, message: 'No errors found in migration test' } });
      }
      setShowDebug(true);
    } catch (error) {
      console.error('Debug errors failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const debugStructures = () => {
    debugDataStructures();
    setShowDebug(true);
  };

  const runSafeMigration = async () => {
    setIsRunning(true);
    try {
      const results = await safeFullMigration();
      setMigrationResults(results);
      setHasData(hasLocalStorageData());
    } catch (error) {
      console.error('Safe migration failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runFixedMigration = async () => {
    setIsRunning(true);
    try {
      console.log('🛠️ Starting Fixed Migration...');
      const results = await fixedFullMigration();
      setMigrationResults(results);
      setHasData(hasLocalStorageData());
    } catch (error) {
      console.error('Fixed migration failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const inspectData = () => {
    const data = inspectLocalStorageData();
    console.log('📊 LocalStorage Data Inspection:', data);
    setShowDebug(true);
  };

  const updateDatabaseSchema = async () => {
    setIsRunning(true);
    try {
      console.log('🔧 Updating database schema for image columns...');
      const response = await apiFetch('/api/update-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Schema update successful:', result);
        setMigrationResults({ 
          schemaUpdate: { 
            success: true, 
            message: 'Database schema updated successfully. Image columns are now TEXT type.' 
          } 
        });
      } else {
        const error = await response.text();
        console.error('❌ Schema update failed:', error);
        setMigrationResults({ 
          schemaUpdate: { 
            success: false, 
            message: `Schema update failed: ${error}` 
          } 
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Schema update error:', error.message);
      } else {
        console.error('Schema update error:', String(error));
      }
      setMigrationResults({ 
        schemaUpdate: { 
          success: false, 
          message: `Schema update error: ${error}` 
        } 
      });
    } finally {
      setIsRunning(false);
    }
  };

  if (!hasData && !migrationResults) {
    return (
      <div style={{
        backgroundColor: '#d1fae5',
        color: '#065f46',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>✅</span> 
        <span>All data is already using the database. No migration needed.</span>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '20px'
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '16px'
      }}>
        📦 Data Migration Tool
      </h3>
      
      {hasData && (
        <div style={{
          backgroundColor: '#fef3c7',
          color: '#92400e',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>⚠️</span>
          <span>localStorage data detected. Click below to migrate it to the database.</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <button
          onClick={runMigration}
          disabled={isRunning || !hasData}
          style={{
            backgroundColor: isRunning ? '#9ca3af' : hasData ? '#2563eb' : '#10b981',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            border: 'none',
            cursor: isRunning || !hasData ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {isRunning ? 'Migrating...' : hasData ? 'Migrate localStorage to Database' : 'Migration Complete'}
        </button>

        <button
          onClick={runEnhancedMigration}
          disabled={isRunning}
          style={{
            backgroundColor: isRunning ? '#9ca3af' : '#7c3aed',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            border: 'none',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {isRunning ? 'Running...' : 'Run Enhanced Migration'}
        </button>

        <button
          onClick={runDebug}
          style={{
            backgroundColor: '#f59e0b',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Debug localStorage
        </button>

        <button
          onClick={diagnoseOutstanding}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Diagnose Outstanding Placements
        </button>

        <button
          onClick={testOutstandingMigration}
          disabled={isRunning}
          style={{
            backgroundColor: isRunning ? '#9ca3af' : '#059669',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            border: 'none',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {isRunning ? 'Testing...' : 'Test Outstanding Migration'}
        </button>

        <button
          onClick={debugSize}
          style={{
            backgroundColor: '#8b5cf6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Debug Data Size
        </button>

        <button
          onClick={fixOutstandingPlacements}
          disabled={isRunning}
          style={{
            backgroundColor: isRunning ? '#9ca3af' : '#10b981',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            border: 'none',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {isRunning ? 'Fixing...' : 'Fix Outstanding Placements'}
        </button>

        <button
          onClick={debugErrors}
          disabled={isRunning}
          style={{
            backgroundColor: isRunning ? '#9ca3af' : '#ef4444',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            border: 'none',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {isRunning ? 'Testing...' : 'Debug Migration Errors'}
        </button>

        <button
          onClick={debugStructures}
          style={{
            backgroundColor: '#6366f1',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Debug Data Structures
        </button>

        <button
          onClick={runSafeMigration}
          disabled={isRunning}
          style={{
            backgroundColor: isRunning ? '#9ca3af' : '#16a34a',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {isRunning ? 'Migrating...' : '🛡️ SAFE MIGRATION (Recommended)'}
        </button>

        <button
          onClick={runFixedMigration}
          disabled={isRunning}
          style={{
            backgroundColor: isRunning ? '#9ca3af' : '#dc2626',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            border: '2px solid #fbbf24'
          }}
        >
          {isRunning ? 'Fixing...' : '🔧 FIXED MIGRATION (For Failed Migrations)'}
        </button>

        <button
          onClick={inspectData}
          style={{
            backgroundColor: '#4338ca',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          🔍 Inspect localStorage Data
        </button>

        <button
          onClick={updateDatabaseSchema}
          disabled={isRunning}
          style={{
            backgroundColor: isRunning ? '#9ca3af' : '#f59e0b',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            border: '2px solid #dc2626'
          }}
        >
          {isRunning ? 'Updating...' : '🗄️ FIX DATABASE SCHEMA (Run First!)'}
        </button>
      </div>

      {migrationResults && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '12px'
          }}>
            Migration Results:
          </h4>
          
          <div style={{ display: 'grid', gap: '8px' }}>
            {Object.entries(migrationResults).map(([key, result]: [string, any]) => (
              <div
                key={key}
                style={{
                  backgroundColor: result.success ? '#d1fae5' : '#fee2e2',
                  color: result.success ? '#065f46' : '#991b1b',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>{result.success ? '✅' : '❌'}</span>
                <span><strong>{key}:</strong> {result.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showDebug && (
        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '16px',
          borderRadius: '6px',
          marginTop: '16px',
          fontSize: '14px',
          fontFamily: 'monospace'
        }}>
          <strong>Debug Info:</strong> Check browser console for localStorage data
        </div>
      )}

      <div style={{
        fontSize: '12px',
        color: '#6b7280',
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        lineHeight: '1.5'
      }}>
        <strong>Note:</strong> This migration tool transfers data from browser localStorage to the database. 
        After successful migration, the localStorage data will be removed and all admin pages will use the database for persistence.
      </div>

      <div style={{
        fontSize: '12px',
        color: '#4b5563',
        marginTop: '12px',
        padding: '12px',
        backgroundColor: '#fef3c7',
        borderRadius: '6px',
        borderLeft: '4px solid #f59e0b',
        lineHeight: '1.5'
      }}>
        <strong>Troubleshooting:</strong>
        <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px' }}>
          <li><strong>🗄️ FIX DATABASE SCHEMA</strong> - If you see "Data too long for column" errors, run this FIRST to update database columns for large image data</li>
          <li><strong>🔧 FIXED MIGRATION</strong> - Use this if you're seeing 500 errors or migration failures. It includes data size optimization and better field mapping</li>
          <li>Use "🔍 Inspect localStorage Data" to see exactly what data needs to be migrated and identify potential issues</li>
          <li>Use "Debug localStorage" to check what data is stored in your browser</li>
          <li>Use "Enhanced Migration" if the standard migration doesn't work properly</li>
          <li>For Outstanding Placements issues, use "Diagnose Outstanding Placements" for detailed analysis</li>
          <li>Use "Test Outstanding Migration" to try different data mapping strategies</li>
          <li>Check browser console for detailed error messages and API responses</li>
          <li>Ensure the backend server is running on port 4000</li>
        </ul>
      </div>

      <div style={{
        fontSize: '12px',
        color: '#dc2626',
        marginTop: '12px',
        padding: '12px',
        backgroundColor: '#fee2e2',
        borderRadius: '6px',
        borderLeft: '4px solid #dc2626',
        lineHeight: '1.5'
      }}>
        <strong>⚠️ Alternative Schema Fix (If button above fails):</strong>
        <br />
        If the "🗄️ FIX DATABASE SCHEMA" button shows routing errors, you can manually run the schema fix:
        <br /><br />
        <code style={{ backgroundColor: '#f3f4f6', padding: '2px 4px', borderRadius: '3px' }}>
          cd admin-backend && node run-schema-fix.js
        </code>
        <br /><br />
        This will update your database columns to handle large image data without needing the API endpoint.
      </div>
    </div>
  );
}