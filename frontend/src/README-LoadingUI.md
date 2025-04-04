# Loading UI Implementation Guide

This guide explains how to implement a consistent loading UI across all pages in the dental clinic management system.

## Loading Implementation

All pages should use a consistent approach to showing loading states. We implement loading states directly in each page component for better visual consistency across admin and dentist pages.

### Implementation Steps

Follow these steps to add the loading UI to a page:

1. **Add loading state**
   ```jsx
   const [isLoading, setIsLoading] = useState(true);
   ```

2. **Handle loading state in data fetching functions**
   ```jsx
   const fetchData = async () => {
     try {
       setIsLoading(true);
       // Your fetch logic here
     } catch (error) {
       console.error('Error:', error);
     } finally {
       setIsLoading(false);
     }
   };
   ```

3. **Add the loading UI directly in your JSX**

   For page layouts with sidebars, keep the sidebar visible and show the loading overlay in the content area:
   ```jsx
   <div className="flex h-screen overflow-hidden">
     <SideBar open={sidebarOpen} setOpen={setSidebarOpen} />
     
     <div className="flex-1 relative">
       {isLoading && (
         <div className="absolute inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-10">
           <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-8 shadow-xl flex flex-col items-center justify-center">
             <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
             <h2 className="text-xl font-semibold">Loading Data...</h2>
           </div>
         </div>
       )}
       
       {!isLoading && (
         /* Your content */
       )}
     </div>
   </div>
   ```

## Implementation Patterns

### Page Loading with Visible Sidebar

All pages with sidebars should keep the sidebar visible during loading states. The loading overlay should only cover the main content area, providing users with visual context of where they are in the application.

Make sure to use:
- `absolute inset-0` for positioning
- `backdrop-blur-sm bg-black/30` for a semi-transparent blurred overlay
- `z-10` to ensure it's above the content but doesn't interfere with other UI elements
- Proper layering with conditional rendering

Example:
```jsx
<div className="flex h-screen overflow-hidden">
  <SideBar open={sidebarOpen} setOpen={setSidebarOpen} />
  
  <div className="flex-1 relative">
    {isLoading && (
      <div className="absolute inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-10">
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-8 shadow-xl flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <h2 className="text-xl font-semibold">Loading Data...</h2>
        </div>
      </div>
    )}
    
    {!isLoading && (
      /* Main content here */
    )}
  </div>
</div>
```

### Component Loading
For smaller UI elements or in-page loading states, use a similar approach but with more targeted positioning:

```jsx
<div className="relative">
  {isProcessing && (
    <div className="absolute inset-0 backdrop-blur-sm bg-black/30 z-10 flex items-center justify-center rounded">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  )}
  {/* Content */}
</div>
```

## Best Practices

1. Always include proper error handling in try/catch blocks
2. Set `isLoading` to true before fetching data, and to false in the finally block
3. Use descriptive loading messages
4. Keep navigation elements (like sidebars) visible during loading
5. Use a semi-transparent blurred overlay (`backdrop-blur-sm bg-black/30`) to clearly indicate loading state while still showing some of the UI underneath
6. Use appropriate z-index values to ensure the loading overlay appears above content
7. Use conditional rendering to show either loading state or content, not both
8. Ensure the loading overlay completely covers the content area
9. Apply the same loading pattern consistently across admin and dentist pages

## Example Pages

For examples of implementation, refer to:
- Admin Pages:
  - `frontend/src/pages/Admin_Dashboard.jsx`
  - `frontend/src/pages/Admin_ViewFeedback.jsx`
  - `frontend/src/pages/Admin_UserManagement.jsx`

- Dentist Pages:
  - `frontend/src/pages/Dentist_Dashboard.jsx`
  - `frontend/src/pages/Dentist_ViewAppointments.jsx`
  - `frontend/src/pages/Dentist_Profile.jsx` 