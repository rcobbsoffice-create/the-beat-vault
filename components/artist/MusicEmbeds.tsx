'use client';

interface MusicEmbed {
  platform: 'spotify' | 'soundcloud' | 'apple';
  url: string;
}

interface MusicEmbedsProps {
  embeds: MusicEmbed[];
}

export function MusicEmbeds({ embeds }: MusicEmbedsProps) {
  const getEmbedUrl = (embed: MusicEmbed) => {
    if (embed.platform === 'spotify') {
      // Convert standard URL to embed URL if needed
      const id = embed.url.split('/').pop()?.split('?')[0];
      return `https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`;
    }
    if (embed.platform === 'soundcloud') {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(embed.url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`;
    }
    return embed.url;
  };

  return (
    <section className="py-12">
      <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 border-l-4 border-primary pl-4">
        Latest Music
      </h2>
      <div className="grid grid-cols-1 gap-6">
        {embeds.map((embed, index) => (
          <div key={index} className="w-full rounded-xl overflow-hidden bg-dark-900 border border-dark-800">
            {embed.platform === 'spotify' ? (
              <iframe
                src={getEmbedUrl(embed)}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-xl"
              />
            ) : embed.platform === 'soundcloud' ? (
              <iframe
                width="100%"
                height="166"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src={getEmbedUrl(embed)}
              />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
