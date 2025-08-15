import { FeatureFlagService } from "./FeatureFlagService";
import type { Router, Request, Response, NextFunction } from "express";

export async function createFlaggleRouter(
  featureFlagService: FeatureFlagService
): Promise<Router> {
  let express: typeof import("express");
  try {
    const expressModule = await import("express");
    express = expressModule.default || expressModule;
  } catch {
    throw new Error(
      "Express is required to use the router. Install it with: npm install express"
    );
  }

  const router = express.Router();

  router.use(express.json());

  const wrapAsync =
    (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
      fn(req, res, next).catch(next);

  // --- Dashboard UI ---
  router.get("/dashboard", async (req: Request, res: Response) => {
    res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Flaggle Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { font-family: 'Inter', sans-serif; }
      .toggle-switch { position: relative; display: inline-block; width: 50px; height: 28px; }
      .toggle-switch input { opacity: 0; width: 0; height: 0; }
      .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #e5e7eb; transition: .4s; border-radius: 28px; }
      .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
      input:checked + .slider { background-color: #2563eb; }
      input:checked + .slider:before { transform: translateX(22px); }
      .modal-bg { background-color: rgba(0,0,0,0.5); }
    </style>
  </head>
  <body class="bg-gray-50 text-gray-800">
    <div class="container mx-auto p-4 md:p-8 max-w-6xl">
      <h1 class="text-4xl font-bold mb-6 text-gray-900">Flaggle Dashboard</h1>

      <!-- Environment Selector -->
      <div class="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-lg shadow mb-6">
        <div class="flex items-center space-x-4 mb-4 md:mb-0">
          <label for="envSelect" class="block text-sm font-medium text-gray-700">Environment</label>
          <select id="envSelect" class="block w-full md:w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
            <option value="dev">dev</option>
            <option value="staging">staging</option>
            <option value="prod">prod</option>
          </select>
        </div>
        <div class="flex space-x-2">
          <button onclick="loadFlags()" class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">Load Flags</button>
          <button onclick="openFlagModal()" class="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75">New Flag</button>
        </div>
      </div>

      <!-- Flags Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enabled</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody id="flagsTable" class="bg-white divide-y divide-gray-200"></tbody>
        </table>
      </div>
    </div>

    <!-- Flag Modal -->
    <div id="flagModal" class="fixed inset-0 hidden flex items-center justify-center modal-bg z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 class="text-xl font-bold mb-4" id="modalTitle">Create Flag</h2>
        <div class="space-y-4">
          <input type="text" id="modalFlagKey" placeholder="Flag Key" class="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"/>
          <input type="text" id="modalFlagDescription" placeholder="Description" class="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"/>
          <select id="modalFlagEnv" class="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500">
            <option value="dev">dev</option>
            <option value="staging">staging</option>
            <option value="prod">prod</option>
          </select>
          <div class="flex items-center space-x-2">
            <input type="checkbox" id="modalFlagEnabled" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
            <label for="modalFlagEnabled" class="text-gray-900">Enabled</label>
          </div>
          <div class="flex justify-end space-x-2 mt-4">
            <button onclick="closeFlagModal()" class="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancel</button>
            <button onclick="submitFlagModal()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Save</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div id="deleteModal" class="fixed inset-0 hidden items-center justify-center modal-bg z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 text-center">
        <h3 class="text-lg font-bold mb-4">Confirm Deletion</h3>
        <p class="mb-6" id="deleteMsg"></p>
        <div class="flex justify-center space-x-4">
          <button onclick="closeDeleteModal()" class="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancel</button>
          <button id="confirmDeleteBtn" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>

    <script>
      const apiBase = '/flaggle';
      let deleteKey = '', deleteEnv = '';

      function openFlagModal(flag) {
        document.getElementById('flagModal').classList.remove('hidden');
        if(flag){
          document.getElementById('modalTitle').innerText = 'Edit Flag';
          document.getElementById('modalFlagKey').value = flag.key;
          document.getElementById('modalFlagDescription').value = flag.description || '';
          document.getElementById('modalFlagEnv').value = flag.environment;
          document.getElementById('modalFlagEnabled').checked = flag.enabled;
          document.getElementById('modalFlagKey').disabled = true;
        } else {
          document.getElementById('modalTitle').innerText = 'Create Flag';
          document.getElementById('modalFlagKey').value = '';
          document.getElementById('modalFlagDescription').value = '';
          document.getElementById('modalFlagEnabled').checked = false;
          document.getElementById('modalFlagKey').disabled = false;
        }
      }

      function closeFlagModal() { document.getElementById('flagModal').classList.add('hidden'); }

      async function submitFlagModal() {
        const key = document.getElementById('modalFlagKey').value;
        const description = document.getElementById('modalFlagDescription').value;
        const environment = document.getElementById('modalFlagEnv').value;
        const enabled = document.getElementById('modalFlagEnabled').checked;
        if(!key) return alert('Key is required');
        await fetch(apiBase+'/', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ key, description, environment, enabled })
        });
        closeFlagModal(); loadFlags();
      }

      function openDeleteModal(key, env){
        deleteKey = key; deleteEnv = env;
        document.getElementById('deleteMsg').innerText = \`Are you sure you want to delete "\${key}" in "\${env}"?\`;
        document.getElementById('deleteModal').classList.remove('hidden');
      }
      function closeDeleteModal(){ document.getElementById('deleteModal').classList.add('hidden'); }
      async function confirmDelete(){ await fetch(\`\${apiBase}/\${deleteEnv}/\${deleteKey}\`,{method:'DELETE'}); closeDeleteModal(); loadFlags(); }

      async function loadFlags() {
        const env = document.getElementById('envSelect').value;
        const res = await fetch(\`\${apiBase}/\${env}\`);
        const flags = await res.json();
        const tbody = document.getElementById('flagsTable'); tbody.innerHTML='';
        if(!flags.length){ tbody.innerHTML='<tr><td colspan="4" class="text-center py-4 text-gray-500">No flags found for this environment.</td></tr>'; }
        flags.forEach(f=>{
          const tr = document.createElement('tr');
          tr.innerHTML = \`
            <td class="px-6 py-4 font-mono text-sm">\${f.key}</td>
            <td class="px-6 py-4">
              <label class="toggle-switch">
                <input type="checkbox" \${f.enabled?'checked':''} onchange="toggleFlag('\${f.key}','\${env}',this.checked)">
                <span class="slider"></span>
              </label>
            </td>
            <td class="px-6 py-4">
              <input type="text" value="\${f.description||''}" onblur="updateDescription('\${f.key}','\${env}',this.value)" class="w-full p-1 border rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <button onclick="openFlagModal({key:'\${f.key}',description:'\${f.description||''}',environment:'\${env}',enabled:\${f.enabled}})" class="text-blue-600 hover:text-blue-900 font-medium mr-2">Edit</button>
              <button onclick="openDeleteModal('\${f.key}','\${env}')" class="text-red-600 hover:text-red-900 font-medium">Delete</button>
            </td>
          \`;
          tbody.appendChild(tr);
        });
      }

      async function postUpdate(key, env, body){
        await fetch(apiBase+'/',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ key, environment: env, ...body })
        });
      }

      async function toggleFlag(key, env, enabled){ await postUpdate(key, env, {enabled}); }
      async function updateDescription(key, env, description){ await postUpdate(key, env, {description}); }

      window.onload = loadFlags;
      document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
    </script>
  </body>
  </html>
  `);
  });

  // --- API Routes ---
  router.get(
    "/:env",
    wrapAsync(async (req: Request, res: Response) => {
      const { env } = req.params;
      const flags = await featureFlagService.getAllFlags(env, true);
      res.json(flags);
    })
  );

  router.get(
    "/:env/:key",
    wrapAsync(async (req: Request, res: Response) => {
      const { env, key } = req.params;
      const enabled = await featureFlagService.isEnabled(key, env, true);
      res.json({ key, enabled });
    })
  );

  router.post(
    "/",
    wrapAsync(async (req: Request, res: Response) => {
      const flag = req.body;
      if (!flag.key || !flag.environment)
        return res.status(400).json({ error: "Missing key or environment" });
      flag.updatedAt = new Date();
      await featureFlagService.setFlag(flag);
      res.json({ message: "Flag saved successfully", flag });
    })
  );

  router.delete(
    "/:env/:key",
    wrapAsync(async (req: Request, res: Response) => {
      const { env, key } = req.params;
      await featureFlagService.deleteFlag(key, env);
      res.json({ message: "Flag deleted successfully" });
    })
  );

  return router;
}
