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
    const repo = urlMatch[2].replace(/\.git$/i, '');
    const strictPath = `${owner}/${repo}`;
    if (!/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/.test(strictPath)) {
      return { valid: false, error: 'INVALID_FORMAT' };
    }
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
    const strictPath = `${owner}/${repo}`;
    if (!/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/.test(strictPath)) {
      return { valid: false, error: 'INVALID_FORMAT' };
    }
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
  const validation = await validateRepoBeforeAnalysis(input);
  return { exists: validation.canProceed, error: validation.error, ...validation };
}

export async function validateRepoBeforeAnalysis(input) {
  try {
    const normalized = normalizeRepoInput(input);
    if (!normalized.valid) {
      return { canProceed: false, error: 'INVALID_FORMAT' };
    }

    const response = await fetch(`https://api.github.com/repos/${normalized.repoPath}`);
    
    if (response.status === 404) {
      return { canProceed: false, error: 'NOT_FOUND', ...normalized };
    }
    
    if (response.status === 403) {
      return { canProceed: false, error: 'FORBIDDEN', ...normalized };
    }

    if (!response.ok) {
      return { canProceed: false, error: 'API_ERROR', ...normalized };
    }

    const repoData = await response.json();

    if (repoData?.private) {
      return { canProceed: false, error: 'PRIVATE', ...normalized, repoData };
    }

    if (Number(repoData?.size || 0) === 0) {
      return { canProceed: false, error: 'EMPTY', ...normalized, repoData };
    }

    return {
      canProceed: true,
      error: null,
      ...normalized,
      repoData,
    };
  } catch (error) {
    console.error('Error checking repo existence:', error);
    return { canProceed: false, error: 'NETWORK_ERROR' };
  }
}
