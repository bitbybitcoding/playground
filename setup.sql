-- ============================================
-- Bit by Bit Coding - Supabase Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    impact_points INTEGER DEFAULT 0,
    weekly_hours INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
    ON public.profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- INVITE CODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.invite_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_by UUID REFERENCES auth.users(id),
    used_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    max_uses INTEGER DEFAULT 1,
    use_count INTEGER DEFAULT 0
);

-- Enable RLS on invite_codes
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Invite Codes RLS Policies
CREATE POLICY "Admins can view all invite codes"
    ON public.invite_codes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can create invite codes"
    ON public.invite_codes
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update invite codes"
    ON public.invite_codes
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete invite codes"
    ON public.invite_codes
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- CHALLENGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    category TEXT NOT NULL,
    constraints TEXT,
    starter_code TEXT DEFAULT '',
    test_cases JSONB DEFAULT '[]'::jsonb,
    expected_output TEXT,
    time_estimate INTEGER DEFAULT 30, -- in minutes
    points INTEGER DEFAULT 10,
    is_published BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on challenges
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Challenges RLS Policies
CREATE POLICY "Anyone can view published challenges"
    ON public.challenges
    FOR SELECT
    USING (is_published = TRUE);

CREATE POLICY "Admins can view all challenges"
    ON public.challenges
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can create challenges"
    ON public.challenges
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update challenges"
    ON public.challenges
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete challenges"
    ON public.challenges
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- USER PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'attempted')),
    code TEXT DEFAULT '',
    attempts INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, challenge_id)
);

-- Enable RLS on user_progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- User Progress RLS Policies
CREATE POLICY "Users can view own progress"
    ON public.user_progress
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
    ON public.user_progress
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can create own progress"
    ON public.user_progress
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
    ON public.user_progress
    FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- PATHWAYS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.pathways (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    total_challenges INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on pathways
ALTER TABLE public.pathways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pathways"
    ON public.pathways
    FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Admins can manage pathways"
    ON public.pathways
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- USER PATHWAY PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_pathway_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    pathway_id UUID REFERENCES public.pathways(id) ON DELETE CASCADE,
    completed_challenges INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, pathway_id)
);

-- Enable RLS on user_pathway_progress
ALTER TABLE public.user_pathway_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pathway progress"
    ON public.user_pathway_progress
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all pathway progress"
    ON public.user_pathway_progress
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, impact_points, weekly_hours)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        0,
        0
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SEED DATA
-- ============================================

-- Insert sample pathways
INSERT INTO public.pathways (name, description, category, total_challenges, is_active) VALUES
    ('Data Science Prep', 'Master Python fundamentals for data science', 'Python', 12, TRUE),
    ('Web Dev Basics', 'Learn the foundations of web development', 'Web', 8, TRUE),
    ('Algorithm Mastery', 'Advanced algorithm design and analysis', 'Algorithms', 24, TRUE)
ON CONFLICT DO NOTHING;

-- Insert sample challenges
INSERT INTO public.challenges (
    title, description, difficulty, category, constraints, starter_code, 
    test_cases, expected_output, time_estimate, points, is_published
) VALUES 
(
    'The Infinite Voyager',
    'Welcome, Commander. Your starship needs an automated system to calculate the duration of deep-space jumps. Complete the calculate_journey function to accept two parameters: distance and speed.',
    'beginner',
    'Python',
    'Distance will always be a positive integer. Speed will be greater than zero. Return a formatted string as shown in the template.',
    'def calculate_journey(distance, speed):\n    # Calculate the total time taken\n    time = distance / speed\n    return f"Travel time: {time} hours"\n\n# Test your function here\ndistance_input = 150\nspeed_input = 60\n\nresult = calculate_journey(distance_input, speed_input)\nprint(result)',
    '[{"input": "calculate_journey(150, 60)", "expected": "Travel time: 2.5 hours"}, {"input": "calculate_journey(300, 50)", "expected": "Travel time: 6.0 hours"}]'::jsonb,
    'Travel time: 2.5 hours',
    15,
    10,
    TRUE
),
(
    'List Comprehension Master',
    'Master the art of one-line Python loops for cleaner, faster code execution.',
    'beginner',
    'Python',
    'Use list comprehension only. No traditional for loops allowed.',
    '# Create a list of squares for numbers 1 to 10\n# Your code here\nsquares = [x**2 for x in range(1, 11)]\nprint(squares)',
    '[{"input": "[x**2 for x in range(1, 6)]", "expected": "[1, 4, 9, 16, 25]"}]'::jsonb,
    '[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]',
    20,
    15,
    TRUE
),
(
    'Dictionary Detective',
    'Audit a nested JSON-like dictionary structure to find hidden data anomalies.',
    'intermediate',
    'Python',
    'Handle missing keys gracefully. Return None if path not found.',
    'def get_nested_value(data, path):\n    # Your code here\n    current = data\n    for key in path:\n        if isinstance(current, dict) and key in current:\n            current = current[key]\n        else:\n            return None\n    return current\n\n# Test\ndata = {"user": {"profile": {"name": "Alex", "age": 25}}}\nprint(get_nested_value(data, ["user", "profile", "name"]))',
    '[{"input": "get_nested_value({\"a\": {\"b\": 1}}, [\"a\", \"b\"])", "expected": "1"}, {"input": "get_nested_value({}, [\"x\"])", "expected": "None"}]'::jsonb,
    'Alex',
    30,
    20,
    TRUE
),
(
    'The Neural Knot',
    'Deconstruct a basic feed-forward neural network using only standard Python libraries. No tensors, no shortcuts—just pure logic.',
    'intermediate',
    'AI/ML',
    'Implement forward pass manually. Use only math and random modules.',
    'import math\nimport random\n\ndef sigmoid(x):\n    return 1 / (1 + math.exp(-x))\n\ndef neuron(inputs, weights, bias):\n    # Your code here\n    total = sum(i * w for i, w in zip(inputs, weights)) + bias\n    return sigmoid(total)\n\n# Test with sample inputs\ninputs = [0.5, 0.3, 0.2]\nweights = [random.random() for _ in range(3)]\nbias = random.random()\nprint(f"Neuron output: {neuron(inputs, weights, bias):.4f}")',
    '[{"input": "sigmoid(0)", "expected": "0.5"}]'::jsonb,
    'Neuron output: 0.xxxx',
    45,
    30,
    TRUE
),
(
    'Array Mastery',
    'Master the foundation of modern computation. Learn to manipulate, transform, and traverse contiguous data structures with maximum efficiency.',
    'beginner',
    'Algorithms',
    'Implement O(n) solution. No built-in rotation functions.',
    'def rotate_array(arr, k):\n    # Rotate array to the right by k steps\n    # Your code here\n    if not arr:\n        return arr\n    k = k % len(arr)\n    return arr[-k:] + arr[:-k]\n\n# Test\narr = [1, 2, 3, 4, 5]\nk = 2\nprint(rotate_array(arr, k))',
    '[{"input": "rotate_array([1,2,3,4,5], 2)", "expected": "[4, 5, 1, 2, 3]"}, {"input": "rotate_array([1,2], 3)", "expected": "[2, 1]"}]'::jsonb,
    '[4, 5, 1, 2, 3]',
    45,
    25,
    TRUE
)
ON CONFLICT DO NOTHING;

-- ============================================
-- CREATE INITIAL ADMIN USER
-- Run this after setting up auth.users
-- ============================================

-- Note: To create the initial admin, use Supabase Auth API or Dashboard:
-- Email: admin@bbbcoding.org
-- Password: bbbadmin2026
-- Then run:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@bbbcoding.org';

-- Or create via SQL (requires auth.users insert permissions):
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
-- VALUES (
--     uuid_generate_v4(),
--     'admin@bbbcoding.org',
--     crypt('bbbadmin2026', gen_salt('bf')),
--     NOW(),
--     '{"full_name": "BbB Admin", "role": "admin"}'::jsonb
-- );
