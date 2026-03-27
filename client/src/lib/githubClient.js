/**
 * Verifica se um repositório GitHub existe e é público
 * @param {string} input URL do repositório (ex: https://github.com/user/repo) ou owner/repo
 * @returns {Promise<{exists: boolean, error?: string}>}
 */
export function normalizeRepoInput(input) {
  const value = String(input || '').trim();
  if (!value) {
    return { valid: false, error: 'INVALID_FORMAT' };
  }

  const urlMatch = value.match(/^https:\/\/github\.com\/([^/\s]+)\/([^/\s]+?)(?:\.git|\/)?$/i);
  if (urlMatch) {
    const owner = urlMatch[1];
    const repo = urlMatch[2];
    return {
      valid: true,
      owner,
      repo,
      repoPath: `${owner}/${repo}`,
      repoUrl: `https://github.com/${owner}/${repo}`,
    };
  }

  const pathMatch = value.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (pathMatch) {
    const owner = pathMatch[1];
    const repo = pathMatch[2].replace(/\.git$/i, '');
    return {
      valid: true,
      owner,
      repo,
      repoPath: `${owner}/${repo}`,
      repoUrl: `https://github.com/${owner}/${repo}`,
    };
  }

  return { valid: false, error: 'INVALID_FORMAT' };
}

export async function checkRepoExists(input) {
  try {
    const normalized = normalizeRepoInput(input);
    if (!normalized.valid) {
      return { exists: false, error: 'INVALID_FORMAT' };
    }

    const response = await fetch(`https://api.github.com/repos/${normalized.repoPath}`);
    
    if (response.status === 404) {
      return { exists: false, error: 'NOT_FOUND' };
    }
    
    if (response.status === 403) {
      return { exists: false, error: 'FORBIDDEN' };
    }

    return { exists: response.ok, error: response.ok ? null : 'API_ERROR', ...normalized };
  } catch (error) {
    console.error('Error checking repo existence:', error);
    return { exists: false, error: 'NETWORK_ERROR' };
  }
}
