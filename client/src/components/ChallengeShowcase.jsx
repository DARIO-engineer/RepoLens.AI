import { useEffect, useMemo, useState } from "react";

const TAG = "githubchallenge";
const API_URL = `https://dev.to/api/articles?tag=${TAG}&per_page=24`;
const TAG_URL = `https://dev.to/t/${TAG}`;

function formatNumber(value) {
  if (!value && value !== 0) return "0";
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);
}

export default function ChallengeShowcase() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(API_URL, { signal: controller.signal });
        if (!res.ok) throw new Error("dev.to api error");
        const data = await res.json();
        setArticles(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") setError(true);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  const participants = useMemo(() => {
    const map = new Map();
    for (const article of articles) {
      if (!article?.user?.username) continue;
      if (!map.has(article.user.username)) {
        map.set(article.user.username, {
          username: article.user.username,
          name: article.user.name || article.user.username,
          avatar: article.user.profile_image_90 || article.user.profile_image,
        });
      }
    }
    return Array.from(map.values()).slice(0, 12);
  }, [articles]);

  const projects = useMemo(() => articles.slice(0, 6), [articles]);
  const ticker = useMemo(() => articles.slice(0, 12), [articles]);

  const count = participants.length || 1;

  return (
    <section className="relative mt-6 mb-12">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-surface-light/60 to-accent/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface-card/60 p-6 sm:p-10">
        <div className="flex flex-col lg:flex-row lg:items-end gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] uppercase tracking-[0.2em]">
              Radar da Comunidade
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-text mt-4">
              Participantes e projetos do
              <span className="block bg-gradient-to-r from-primary-light via-accent to-accent-green bg-clip-text text-transparent">
                #GitHubChallenge
              </span>
            </h3>
            <p className="text-sm text-text-muted mt-3 max-w-2xl">
              Coletamos os posts do DEV para criar uma vitrine viva de pessoas e ideias.
              Curadoria automática com destaque visual para quem está construindo agora.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-surface-light/80 px-4 py-2 text-xs text-text-muted">
              <span className="text-text font-semibold">{formatNumber(articles.length)}</span> projetos
            </div>
            <a
              href={TAG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary/15 text-primary-light border border-primary/30 hover:bg-primary/25 transition-colors"
            >
              Ver no DEV
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h6m0 0v6m0-6L10 20" />
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-full border border-white/5 animate-spin [animation-duration:36s]" />
            <div className="absolute inset-8 rounded-full border border-primary/20 animate-spin [animation-duration:26s] [animation-direction:reverse]" />
            <div className="relative aspect-square w-full max-w-md mx-auto">
              {participants.map((p, i) => {
                const angle = (360 / count) * i;
                const radius = 140 + (i % 3) * 18;
                return (
                  <div
                    key={p.username}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${radius}px)`
                    }}
                  >
                    <div className="group flex flex-col items-center" style={{ transform: `rotate(-${angle}deg)` }}>
                      <div className="relative">
                        <span className="absolute inset-0 rounded-full bg-accent/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="relative w-11 h-11 rounded-full ring-2 ring-white/10 object-cover shadow-lg"
                        />
                      </div>
                      <span className="mt-2 text-[10px] text-text-muted max-w-[72px] truncate">
                        {p.name}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 border border-white/10 px-6 py-5 text-center backdrop-blur-sm animate-pulse-glow">
                  <p className="text-[11px] uppercase tracking-[0.4em] text-text-muted">Constelação</p>
                  <p className="text-lg font-bold text-text">Comunidade em órbita</p>
                  <p className="text-xs text-text-muted mt-1">
                    {participants.length} criadores em destaque
                  </p>
                </div>
              </div>
            </div>

            <div className="marquee mt-8">
              <div className="marquee-track">
                {[...ticker, ...ticker].map((item, i) => (
                  <span
                    key={`${item.id}-${i}`}
                    className="px-4 py-2 rounded-full bg-surface-light/70 border border-white/10 text-[11px] text-text-muted uppercase tracking-widest"
                  >
                    {item.title}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm uppercase tracking-[0.35em] text-text-muted">Projetos em foco</h4>
              <span className="text-[11px] text-text-muted">popular agora</span>
            </div>

            {loading && (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-20 rounded-2xl bg-surface-light/60 border border-white/5 skeleton" />
                ))}
              </div>
            )}

            {error && !loading && (
              <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-xs text-warning">
                Não foi possível carregar o feed agora. Tente novamente mais tarde.
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-3">
                {projects.map((project) => (
                  <a
                    key={project.id}
                    href={`https://dev.to${project.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-4 rounded-2xl border border-white/10 bg-surface-light/60 p-4 hover:border-primary/30 hover:bg-surface-light/80 transition-all"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-surface-card/80 shrink-0">
                      {project.cover_image ? (
                        <img src={project.cover_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/10" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text group-hover:text-primary-light transition-colors truncate">
                        {project.title}
                      </p>
                      <p className="text-xs text-text-muted mt-1 line-clamp-2">
                        {project.description || project.readable_publish_date}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-text-muted">
                        <span className="uppercase tracking-widest">{project.user?.name}</span>
                        <span>{formatNumber(project.positive_reactions_count)} reações</span>
                        <span>{project.reading_time_minutes} min</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            Atualização contínua via DEV API
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-light" />
            Foco em participantes e submissions recentes
          </div>
        </div>
      </div>
    </section>
  );
}
