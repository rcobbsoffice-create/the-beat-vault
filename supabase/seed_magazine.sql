-- UPSERT Magazine Articles with verified working images from stable IDs
INSERT INTO
    articles (
        slug,
        title,
        excerpt,
        content,
        category,
        status,
        featured,
        published_at,
        image_url
    )
VALUES (
        'the-future-of-trap-2026',
        'The Future of Trap: 2026 and Beyond',
        'Explore how the next generation of producers is redefining the sonic landscape of trap music with AI-hybrid workflows.',
        'Full article content about the evolution of trap music, focusing on granular synthesis and generative patterns...',
        'Feature',
        'published',
        true,
        NOW(),
        'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop'
    ),
    (
        'mastering-your-home-studio',
        'Mastering Your Home Studio: Minimalist Setup',
        'Why the most expensive gear isn''t always the best. A guide to building a world-class studio in a bedroom.',
        'Deep dive into acoustic treatment, monitor placement, and the essential software stack for modern producers...',
        'Tutorial',
        'published',
        false,
        NOW() - INTERVAL '1 day',
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop'
    ),
    (
        'underground-gems-vol-12',
        'Underground Gems: Vol. 12',
        'Our weekly roundup of the freshest beats and undiscovered talent from the AudioGenes community.',
        'This week we spotlight three rising stars who are pushing the boundaries of rhythm and melody...',
        'Weekly Roundup',
        'published',
        false,
        NOW() - INTERVAL '2 days',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop'
    ),
    (
        'the-art-of-sampling',
        'The Art of Sampling',
        'Master the legal and creative aspects of using samples in your tracks.',
        'Exploring the boundary between inspiration and imitation in modern music production...',
        'Editor''s Picks',
        'published',
        false,
        NOW() - INTERVAL '3 days',
        'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1200&auto=format&fit=crop'
    ),
    (
        'analog-vs-digital',
        'Analog vs. Digital: The Great Debate',
        'Is there really a difference in warmth? We put the top synths to the test.',
        'A scientific and subjective comparison of hardware and software synthesis...',
        'Editor''s Picks',
        'published',
        false,
        NOW() - INTERVAL '4 days',
        'https://images.unsplash.com/photo-1591587120876-09b54e7045d7?q=80&w=1200&auto=format&fit=crop'
    ),
    (
        'marketing-for-producers',
        'Marketing for Producers',
        'How to build a brand that stands out in a crowded marketplace.',
        'Social media strategies, branding tips, and networking advice for the modern beatmaker...',
        'Editor''s Picks',
        'published',
        false,
        NOW() - INTERVAL '5 days',
        'https://images.unsplash.com/photo-1558403194-611308249627?q=80&w=1200&auto=format&fit=crop'
    ),
    (
        'the-beat-making-formula',
        'The Beatmaking Formula',
        'Is there a secret sauce to a hit? We interview top producers about their creative process.',
        'Breaking down the structure, rhythm, and melody of today''s biggest chart-toppers...',
        'Technique',
        'published',
        false,
        NOW() - INTERVAL '6 days',
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop'
    ),
    (
        'monetizing-your-sound',
        'Monetizing Your Sound: Beyond Licensing',
        'How to diversify your income streams as a producer in the digital age.',
        'From sample packs to sync deals, exploring the business side of music production...',
        'Business',
        'published',
        false,
        NOW() - INTERVAL '7 days',
        'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=1200&auto=format&fit=crop'
    ) ON CONFLICT (slug) DO
UPDATE
SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    content = EXCLUDED.content,
    category = EXCLUDED.category,
    status = EXCLUDED.status,
    featured = EXCLUDED.featured,
    image_url = EXCLUDED.image_url,
    updated_at = NOW();

-- Clear and Re-seed Charts
DELETE FROM charts;

INSERT INTO
    charts (
        rank,
        last_rank,
        title,
        artist_name,
        chart_type,
        week_start,
        image_url
    )
VALUES (
        1,
        1,
        'Hyperdrive',
        'Voltz',
        'top_100',
        CURRENT_DATE,
        'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&auto=format&fit=crop'
    ),
    (
        2,
        4,
        'Neon Nights',
        'Lumina',
        'top_100',
        CURRENT_DATE,
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop'
    ),
    (
        3,
        2,
        'Midnight Drift',
        'Retro Kid',
        'top_100',
        CURRENT_DATE,
        'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop'
    ),
    (
        4,
        3,
        'Sonic Bloom',
        'Aura',
        'top_100',
        CURRENT_DATE,
        'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=800&auto=format&fit=crop'
    ),
    (
        5,
        5,
        'Echoes',
        'Pulse',
        'top_100',
        CURRENT_DATE,
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop'
    ),
    (
        6,
        10,
        'Basement Tapes',
        'Rough Cut',
        'top_100',
        CURRENT_DATE,
        'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=800&auto=format&fit=crop'
    ),
    (
        7,
        12,
        'Ghost in the Machine',
        'Synth Lord',
        'top_100',
        CURRENT_DATE,
        'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop'
    ),
    (
        8,
        6,
        'Urban Legend',
        'Street King',
        'top_100',
        CURRENT_DATE,
        'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?q=80&w=800&auto=format&fit=crop'
    );