# Admin Alert Integration Guide

This guide shows how to integrate the alert system in all admin pages.

## Backend Integration

All backend endpoints have been updated to return an alert object in the response:

```json
{
  ...data,
  "alert": {
    "type": "success",
    "message": "Data saved successfully!"
  }
}
```

## Frontend Integration

### 1. Import Required Components

```typescript
import Alert from '@/components/Alert';
import { useAlert } from '@/hooks/useAlert';
```

### 2. Initialize the Alert Hook

```typescript
const { alert, showAlert, hideAlert, handleApiResponse } = useAlert();
```

### 3. Add Alert Component to JSX

```typescript
return (
  <AdminLayout title="Page Title">
    {alert && (
      <Alert
        type={alert.type}
        message={alert.message}
        onClose={hideAlert}
      />
    )}
    {/* Rest of your content */}
  </AdminLayout>
);
```

### 4. Handle API Responses

When making API calls, use the `handleApiResponse` function:

```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000'}/api/endpoint`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

if (response.ok) {
  const data = await response.json();
  handleApiResponse(data); // This will show the alert if present
} else {
  showAlert('error', 'Failed to save data');
}
```

### 5. Manual Alerts

You can also show alerts manually:

```typescript
// Success alert
showAlert('success', 'Operation completed successfully!');

// Error alert
showAlert('error', 'Something went wrong!');

// Warning alert
showAlert('warning', 'Please check your input');

// Info alert
showAlert('info', 'Did you know?');
```

## Complete Example

Here's a complete example of an admin page with alert integration:

```typescript
"use client";
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Alert from '@/components/Alert';
import { useAlert } from '@/hooks/useAlert';

export default function ExampleAdmin() {
  const [data, setData] = useState({});
  const [saving, setSaving] = useState(false);
  const { alert, showAlert, hideAlert, handleApiResponse } = useAlert();

  const handleSave = async () => {
    setSaving(true);
    try {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000'}/api/example`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        handleApiResponse(responseData);
      } else {
        showAlert('error', 'Failed to save data');
      }
    } catch (error) {
      showAlert('error', 'An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Example Admin">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={hideAlert}
        />
      )}
      
      {/* Your form content here */}
      
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </AdminLayout>
  );
}
```

## Pages to Update

The following admin pages need to be updated with the alert system:

1. `/admin/admission/page.tsx`
2. `/admin/events/page.tsx`
3. `/admin/smtp/page.tsx`
4. `/admin/aboutus/director-desk/page.tsx`
5. `/admin/aboutus/our-philosophy/page.tsx`
6. `/admin/aboutus/about-group/page.tsx`
7. `/admin/home-slider/page.tsx`
8. `/admin/outstanding-placements/page.tsx`
9. `/admin/testimonial/page.tsx`
10. `/admin/why-choose-us/page.tsx`
11. `/admin/our-recruiters/page.tsx`
12. `/admin/our-institutions/page.tsx`
13. `/admin/our-success/page.tsx`
14. `/admin/placement/page.tsx`

Each page should follow the integration pattern shown above.