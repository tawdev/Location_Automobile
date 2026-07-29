<!-- BEGIN:nextjs-agent-rules -->

Read /Back-end (controllers , services , models , migrations) 
Read /front ( do not read everything like module of node and these very very long files , only the things has relation with the app)

<!-- END:nextjs-agent-rules -->

<!-- FIX: Images on press/blog/careers pages were broken because `vehicleImageUrl` in 
  src/lib/media.ts was constructing direct URLs to the Laravel backend 
  (http://127.0.0.1:8000/storage/...). Caused issues with CORS, port mismatches, 
  and symlinks on Windows/WAMP.

  FIX: Changed to use the existing Next.js proxy route at /api/storage/[...path] 
  which fetches from the Laravel backend server-side and returns the image locally. 
  This eliminates CORS/port/symlink issues.

  Files changed:
  - src/lib/media.ts (vehicleImageUrl function)
  - src/app/api/storage/[...path]/route.ts (already existed, now actually used) -->
