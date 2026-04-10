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

CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_used ON public.invite_codes(used);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'invite_codes_max_uses_positive'
    ) THEN
        ALTER TABLE public.invite_codes
        ADD CONSTRAINT invite_codes_max_uses_positive CHECK (max_uses >= 1);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'invite_codes_use_count_non_negative'
    ) THEN
        ALTER TABLE public.invite_codes
        ADD CONSTRAINT invite_codes_use_count_non_negative CHECK (use_count >= 0);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'invite_codes_use_count_within_max_uses'
    ) THEN
        ALTER TABLE public.invite_codes
        ADD CONSTRAINT invite_codes_use_count_within_max_uses CHECK (use_count <= max_uses);
    END IF;
END $$;

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

-- Allow anyone (including unauthenticated) to read invite codes for signup validation
CREATE POLICY "Anyone can read invite codes for validation"
    ON public.invite_codes
    FOR SELECT
    USING (used=false);

-- ============================================
-- CHALLENGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    language TEXT NOT NULL DEFAULT 'python' CHECK (language IN ('python')),
    category TEXT NOT NULL,
    constraints TEXT,
    starter_code TEXT DEFAULT '',
    test_cases JSONB DEFAULT '[]'::jsonb,
    hints JSONB DEFAULT '[]'::jsonb,
    expected_output TEXT,
    time_estimate INTEGER DEFAULT 30, -- in minutes
    points INTEGER DEFAULT 10,
    is_published BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backward-compatible schema upgrades
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'python';
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS hints JSONB DEFAULT '[]'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS idx_challenges_slug_unique ON public.challenges(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_challenges_published_difficulty ON public.challenges(is_published, difficulty);
CREATE INDEX IF NOT EXISTS idx_challenges_category ON public.challenges(category);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'challenges_points_non_negative'
    ) THEN
        ALTER TABLE public.challenges
        ADD CONSTRAINT challenges_points_non_negative CHECK (points >= 0);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'challenges_time_estimate_positive'
    ) THEN
        ALTER TABLE public.challenges
        ADD CONSTRAINT challenges_time_estimate_positive CHECK (time_estimate > 0);
    END IF;
END $$;

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

CREATE INDEX IF NOT EXISTS idx_user_progress_user_status ON public.user_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_progress_challenge ON public.user_progress(challenge_id);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_progress_attempts_non_negative'
    ) THEN
        ALTER TABLE public.user_progress
        ADD CONSTRAINT user_progress_attempts_non_negative CHECK (attempts >= 0);
    END IF;
END $$;

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
-- CHALLENGE SUBMISSIONS TABLE (ATTEMPT HISTORY)
-- ============================================
CREATE TABLE IF NOT EXISTS public.challenge_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    submitted_code TEXT NOT NULL,
    terminal_output TEXT DEFAULT '',
    is_correct BOOLEAN DEFAULT FALSE,
    runtime_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_challenge_submissions_user ON public.challenge_submissions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_challenge ON public.challenge_submissions(challenge_id, created_at DESC);

CREATE POLICY "Users can view own submissions"
    ON public.challenge_submissions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own submissions"
    ON public.challenge_submissions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions"
    ON public.challenge_submissions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- CHALLENGE BOOKMARKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.challenge_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.challenge_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_challenge_bookmarks_user ON public.challenge_bookmarks(user_id, created_at DESC);

CREATE POLICY "Users can view own bookmarks"
    ON public.challenge_bookmarks
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks"
    ON public.challenge_bookmarks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
    ON public.challenge_bookmarks
    FOR DELETE
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
-- PATHWAY CHALLENGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.pathway_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pathway_id UUID NOT NULL REFERENCES public.pathways(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(pathway_id, challenge_id),
    UNIQUE(pathway_id, sequence_order)
);

ALTER TABLE public.pathway_challenges ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_pathway_challenges_pathway ON public.pathway_challenges(pathway_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_pathway_challenges_challenge ON public.pathway_challenges(challenge_id);

CREATE POLICY "Anyone can view pathway challenges"
    ON public.pathway_challenges
    FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Admins can manage pathway challenges"
    ON public.pathway_challenges
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
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

-- Insert additional challenge catalog (20+)
INSERT INTO public.challenges (
    slug, title, description, difficulty, language, category, constraints, starter_code,
    test_cases, expected_output, time_estimate, points, is_published
)
SELECT
    seed.slug,
    seed.title,
    seed.description,
    seed.difficulty,
    seed.language,
    seed.category,
    seed.constraints,
    seed.starter_code,
    seed.test_cases::jsonb,
    seed.expected_output,
    seed.time_estimate,
    seed.points,
    seed.is_published
FROM (
    VALUES
    ('sum-even-numbers', 'Sum Even Numbers', 'Return the sum of all even numbers in a list.', 'beginner', 'python', 'Python', 'Input list may be empty.', 'def sum_even(nums):\n    return sum(n for n in nums if n % 2 == 0)', '[{"input":"sum_even([1,2,3,4])","expected":"6"},{"input":"sum_even([])","expected":"0"}]', '6', 15, 10, TRUE),
    ('count-vowels', 'Count Vowels', 'Count vowels in a string.', 'beginner', 'python', 'Python', 'Case-insensitive counting.', 'def count_vowels(text):\n    vowels = set("aeiou")\n    return sum(1 for c in text.lower() if c in vowels)\n\nprint(count_vowels("hello world"))', '[{"input":"count_vowels(\"hello\")","expected":"2"}]', '3', 15, 10, TRUE),
    ('palindrome-checker', 'Palindrome Checker', 'Check whether a string is a palindrome.', 'beginner', 'python', 'Algorithms', 'Ignore spaces and punctuation.', 'def is_palindrome(text):\n    filtered = "".join(c.lower() for c in text if c.isalnum())\n    return filtered == filtered[::-1]\n\nprint(is_palindrome("racecar"))', '[{"input":"is_palindrome(\"A man, a plan, a canal: Panama\")","expected":"True"}]', 'True', 20, 12, TRUE),
    ('max-consecutive-ones', 'Max Consecutive Ones', 'Find longest run of 1s in a binary list.', 'beginner', 'python', 'Algorithms', 'Input contains only 0 and 1.', 'def max_ones(nums):\n    best = cur = 0\n    for n in nums:\n        cur = cur + 1 if n == 1 else 0\n        best = max(best, cur)\n    return best\n\nprint(max_ones([1,1,0,1,1,1]))', '[{"input":"max_ones([1,1,0,1,1,1])","expected":"3"}]', '3', 20, 12, TRUE),
    ('list-flatten-one-level', 'Flatten One Level', 'Flatten a nested list by one level.', 'beginner', 'python', 'Python', 'Only one level of nesting.', 'def flatten_once(items):\n    out = []\n    for item in items:\n        if isinstance(item, list):\n            out.extend(item)\n        else:\n            out.append(item)\n    return out\n\nprint(flatten_once([1,[2,3],4]))', '[{"input":"flatten_once([1,[2,3],4])","expected":"[1, 2, 3, 4]"}]', '[1, 2, 3, 4]', 20, 12, TRUE),
    ('word-frequency-map', 'Word Frequency Map', 'Build a dictionary of word counts.', 'intermediate', 'python', 'Python', 'Split by whitespace.', 'def word_freq(text):\n    result = {}\n    for word in text.split():\n        result[word] = result.get(word, 0) + 1\n    return result', '[{"input":"word_freq(\"a b a\")","expected":"{\"a\": 2, \"b\": 1}"}]', '{"a": 2, "b": 1}', 25, 15, TRUE),
    ('merge-sorted-lists', 'Merge Sorted Lists', 'Merge two sorted lists into one sorted list.', 'intermediate', 'python', 'Algorithms', 'Do not use sort on the final output.', 'def merge_sorted(a, b):\n    i = j = 0\n    out = []\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            out.append(a[i]); i += 1\n        else:\n            out.append(b[j]); j += 1\n    out.extend(a[i:]); out.extend(b[j:])\n    return out\n\nprint(merge_sorted([1,3],[2,4]))', '[{"input":"merge_sorted([1,3],[2,4])","expected":"[1, 2, 3, 4]"}]', '[1, 2, 3, 4]', 30, 18, TRUE),
    ('two-sum-indexes', 'Two Sum Indexes', 'Return indexes of two numbers that sum to target.', 'intermediate', 'python', 'Algorithms', 'Exactly one solution exists.', 'def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []\n\nprint(two_sum([2,7,11,15], 9))', '[{"input":"two_sum([2,7,11,15],9)","expected":"[0, 1]"}]', '[0, 1]', 30, 18, TRUE),
    ('group-anagrams', 'Group Anagrams', 'Group words that are anagrams.', 'intermediate', 'python', 'Algorithms', 'Return list of grouped lists.', 'def group_anagrams(words):\n    groups = {}\n    for word in words:\n        key = "".join(sorted(word))\n        groups.setdefault(key, []).append(word)\n    return list(groups.values())\n\nprint(group_anagrams(["eat","tea","tan","ate"]))', '[{"input":"len(group_anagrams([\"eat\",\"tea\",\"ate\"]))","expected":"1"}]', '[[\'eat\', \'tea\', \'ate\'], [\'tan\']]', 35, 20, TRUE),
    ('valid-parentheses', 'Valid Parentheses', 'Validate bracket pairs using stack.', 'intermediate', 'python', 'Algorithms', 'Input contains only ()[]{}.', 'def is_valid(s):\n    stack = []\n    for ch in s:\n        if ch in "([{":\n            stack.append(ch)\n        elif ch == ")":\n            if not stack or stack.pop() != "(":\n                return False\n        elif ch == "]":\n            if not stack or stack.pop() != "[":\n                return False\n        elif ch == "}":\n            if not stack or stack.pop() != "{":\n                return False\n    return not stack\n\nprint(is_valid("()[]{}"))', '[{"input":"is_valid(\"()[]{}\")","expected":"True"},{"input":"is_valid(\"(]\")","expected":"False"}]', 'True', 30, 18, TRUE),
    ('binary-search', 'Binary Search', 'Implement classic binary search.', 'intermediate', 'python', 'Algorithms', 'Return -1 if target not found.', 'def binary_search(nums, target):\n    lo, hi = 0, len(nums)-1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n\nprint(binary_search([1,3,5,7], 5))', '[{"input":"binary_search([1,3,5,7],5)","expected":"2"}]', '2', 30, 18, TRUE),
    ('matrix-transpose', 'Matrix Transpose', 'Transpose a 2D matrix.', 'intermediate', 'python', 'Python', 'Matrix is rectangular.', 'def transpose(m):\n    return [list(row) for row in zip(*m)]\n\nprint(transpose([[1,2,3],[4,5,6]]))', '[{"input":"transpose([[1,2,3],[4,5,6]])","expected":"[[1, 4], [2, 5], [3, 6]]"}]', '[[1, 4], [2, 5], [3, 6]]', 25, 16, TRUE),
    ('fibonacci-memo', 'Fibonacci with Memoization', 'Compute fibonacci efficiently using memoization.', 'advanced', 'python', 'Algorithms', 'n can be up to 100.', 'def fib(n, memo=None):\n    if memo is None:\n        memo = {0:0, 1:1}\n    if n in memo:\n        return memo[n]\n    memo[n] = fib(n-1, memo) + fib(n-2, memo)\n    return memo[n]\n\nprint(fib(10))', '[{"input":"fib(10)","expected":"55"}]', '55', 40, 25, TRUE),
    ('lru-cache-sim', 'LRU Cache Simulator', 'Simulate an LRU cache with fixed capacity.', 'advanced', 'python', 'Algorithms', 'Use OrderedDict from collections.', 'from collections import OrderedDict\n\nclass LRU:\n    def __init__(self, cap):\n        self.cap = cap\n        self.data = OrderedDict()\n    def put(self, k, v):\n        if k in self.data:\n            self.data.move_to_end(k)\n        self.data[k] = v\n        if len(self.data) > self.cap:\n            self.data.popitem(last=False)\n\nc = LRU(2)\nc.put(1,1); c.put(2,2); c.put(3,3)\nprint(list(c.data.keys()))', '[{"input":"list((lambda c: (c.put(1,1), c.put(2,2), c.put(3,3), c.data.keys()))(LRU(2))[-1])","expected":"[2, 3]"}]', '[2, 3]', 45, 28, TRUE),
    ('top-k-frequent', 'Top K Frequent Elements', 'Return k most frequent numbers.', 'advanced', 'python', 'Algorithms', 'Use heapq for efficiency.', 'import heapq\n\ndef top_k(nums, k):\n    counts = {}\n    for n in nums:\n        counts[n] = counts.get(n, 0) + 1\n    return [n for n, _ in heapq.nlargest(k, counts.items(), key=lambda x: x[1])]\n\nprint(top_k([1,1,1,2,2,3], 2))', '[{"input":"top_k([1,1,1,2,2,3],2)","expected":"[1, 2]"}]', '[1, 2]', 40, 26, TRUE),
    ('longest-substring-no-repeat', 'Longest Substring Without Repeat', 'Find length of longest substring without repeating characters.', 'advanced', 'python', 'Algorithms', 'Use sliding window.', 'def longest_unique(s):\n    seen = {}\n    left = best = 0\n    for right, ch in enumerate(s):\n        if ch in seen and seen[ch] >= left:\n            left = seen[ch] + 1\n        seen[ch] = right\n        best = max(best, right - left + 1)\n    return best\n\nprint(longest_unique("abcabcbb"))', '[{"input":"longest_unique(\"abcabcbb\")","expected":"3"}]', '3', 45, 30, TRUE),
    ('json-config-validator', 'JSON Config Validator', 'Validate required keys in nested config dictionaries.', 'advanced', 'python', 'Python', 'Return list of missing key paths.', 'def missing_paths(cfg, required):\n    missing = []\n    for path in required:\n        cur = cfg\n        ok = True\n        for key in path.split("."):\n            if isinstance(cur, dict) and key in cur:\n                cur = cur[key]\n            else:\n                ok = False\n                break\n        if not ok:\n            missing.append(path)\n    return missing\n\nprint(missing_paths({"db":{"host":"x"}}, ["db.host","db.port"]))', '[{"input":"missing_paths({\"db\":{\"host\":\"x\"}}, [\"db.host\",\"db.port\"])","expected":"[\"db.port\"]"}]', '["db.port"]', 40, 24, TRUE),
    ('prime-sieve', 'Prime Sieve', 'Generate all prime numbers up to n.', 'intermediate', 'python', 'Algorithms', 'Implement Sieve of Eratosthenes.', 'def sieve(n):\n    if n < 2:\n        return []\n    is_prime = [True] * (n + 1)\n    is_prime[0] = is_prime[1] = False\n    p = 2\n    while p * p <= n:\n        if is_prime[p]:\n            for i in range(p * p, n + 1, p):\n                is_prime[i] = False\n        p += 1\n    return [i for i in range(2, n + 1) if is_prime[i]]\n\nprint(sieve(10))', '[{"input":"sieve(10)","expected":"[2, 3, 5, 7]"}]', '[2, 3, 5, 7]', 35, 20, TRUE),
    ('stack-min', 'Min Stack', 'Design a stack that returns minimum in O(1).', 'advanced', 'python', 'Data Structures', 'Support push, pop, and get_min.', 'class MinStack:\n    def __init__(self):\n        self.stack = []\n        self.mins = []\n    def push(self, x):\n        self.stack.append(x)\n        self.mins.append(x if not self.mins else min(x, self.mins[-1]))\n    def pop(self):\n        self.mins.pop(); return self.stack.pop()\n    def get_min(self):\n        return self.mins[-1]\n\ns = MinStack(); s.push(3); s.push(1); s.push(2)\nprint(s.get_min())', '[{"input":"(lambda s: (s.push(3), s.push(1), s.push(2), s.get_min()))(MinStack())[-1]","expected":"1"}]', '1', 45, 30, TRUE),
    ('queue-with-stacks', 'Queue Using Two Stacks', 'Implement queue operations using two stacks.', 'intermediate', 'python', 'Data Structures', 'Implement enqueue/dequeue.', 'class MyQueue:\n    def __init__(self):\n        self.a = []\n        self.b = []\n    def enqueue(self, x):\n        self.a.append(x)\n    def dequeue(self):\n        if not self.b:\n            while self.a:\n                self.b.append(self.a.pop())\n        return self.b.pop() if self.b else None\n\nq = MyQueue(); q.enqueue(1); q.enqueue(2)\nprint(q.dequeue())', '[{"input":"(lambda q: (q.enqueue(1), q.enqueue(2), q.dequeue()))(MyQueue())[-1]","expected":"1"}]', '1', 35, 20, TRUE),
    ('roman-to-integer', 'Roman to Integer', 'Convert Roman numerals into integers.', 'beginner', 'python', 'Algorithms', 'Valid Roman numeral input.', 'def roman_to_int(s):\n    vals = {"I":1,"V":5,"X":10,"L":50,"C":100,"D":500,"M":1000}\n    total = 0\n    prev = 0\n    for ch in reversed(s):\n        val = vals[ch]\n        total += -val if val < prev else val\n        prev = val\n    return total\n\nprint(roman_to_int("MCMXCIV"))', '[{"input":"roman_to_int(\"III\")","expected":"3"},{"input":"roman_to_int(\"MCMXCIV\")","expected":"1994"}]', '1994', 25, 14, TRUE),
    ('analyze-log-levels', 'Analyze Log Levels', 'Count INFO/WARN/ERROR log entries.', 'beginner', 'python', 'Python', 'Input is a list of log strings.', 'def count_levels(lines):\n    counts = {"INFO":0,"WARN":0,"ERROR":0}\n    for line in lines:\n        for key in counts:\n            if line.startswith(key):\n                counts[key] += 1\n    return counts\n\nprint(count_levels(["INFO a","ERROR b","WARN c","ERROR d"]))', '[{"input":"count_levels([\"INFO a\",\"ERROR b\"])", "expected":"{\"INFO\": 1, \"WARN\": 0, \"ERROR\": 1}"}]', '{"INFO": 1, "WARN": 1, "ERROR": 2}', 20, 12, TRUE)
) AS seed(
    slug, title, description, difficulty, language, category, constraints, starter_code,
    test_cases, expected_output, time_estimate, points, is_published
)
WHERE NOT EXISTS (
    SELECT 1
    FROM public.challenges c
    WHERE c.title = seed.title
);

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
