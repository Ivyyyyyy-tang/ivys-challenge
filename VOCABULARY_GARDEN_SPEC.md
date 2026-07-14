# 1. Feature Vision

Vocabulary Garden exists to make vocabulary growth visible, personal, and emotionally legible. The current learning system already helps the learner study, review, and track words, but most of that progress is experienced as numbers, lists, and isolated actions. Vocabulary Garden should transform that progress into a living visual narrative.

This feature changes the vocabulary learning experience by giving the learner a calm visual reflection of long-term effort. Instead of feeling like words are only completed or incomplete, the learner should feel that every meaningful encounter contributes to the cultivation of a personal knowledge landscape.

The relationship between vocabulary and personal growth is central to the feature. A growing vocabulary is not just a larger database of remembered terms. It reflects discipline, patience, refinement, and the gradual expansion of perception. Vocabulary Garden should express the idea that learning words is also a form of shaping the self.

# 2. Core Concept

One vocabulary word represents a living unit of growth. It is not only an item to memorize, but a small personal learning organism whose condition changes according to exposure, review quality, and retention stability.

A chapter represents a themed zone of cultivation. It groups related words into one learning territory and allows the learner to see progress at a meaningful intermediate scale, larger than a single word but smaller than the whole system.

A garden represents the learner's evolving English world. It is the visual form of accumulated effort across chapters, reviews, rediscovered words, and personal selections. The garden should communicate both structure and intimacy: it is organized, but it is also uniquely the learner's own.

# 3. Growth System

Vocabulary Garden should use a staged growth model that feels elegant, understandable, and emotionally resonant without becoming game-like.

Recommended word states:

- Dormant
  - The word exists in the system but has not yet meaningfully entered active learning.
  - Visually quiet, understated, and low-emphasis.

- Emergent
  - The learner has begun engaging with the word, but retention is still unstable.
  - This stage reflects first contact, early recognition, and fragile memory.

- Rooted
  - The word has been reviewed successfully enough to show real retention.
  - It is no longer new, but it still benefits from reinforcement.

- Flourishing
  - The word is consistently recognized and behaves like dependable vocabulary.
  - This should feel like stable growth, not final completion.

- Fading
  - The word was once stronger but has weakened through failed review or long neglect.
  - This state is important because it makes forgetting visible without framing it as punishment.

These states should not be treated as decorative labels. They should reflect genuine learning condition and help the learner understand what needs attention.

# 4. Interaction Rules

After learning a word, the word should enter the garden in an initial visible state. It should move from an inactive presence into early growth once the learner has meaningfully engaged with it.

After review success, the word should strengthen. Repeated successful reviews should deepen its stability and move it toward a more mature growth state. Growth should feel cumulative rather than binary.

After review failure, the word should weaken. A single failure should not necessarily collapse the word to the beginning, but repeated failure or clear instability should visibly reduce its condition. The purpose is to reflect memory truthfully, not to create frustration.

The garden should update as part of the broader learning cycle, not as a separate manual activity. When the learner studies, reviews, recalls, forgets, or re-encounters words, the garden should reflect those changes. Updates should feel calm and informative rather than noisy or celebratory.

# 5. Visual Design Requirements

Vocabulary Garden must match the overall style of Ivy's Challenge:

- clean
- minimal
- premium
- calm
- personal

The visual language should feel closer to editorial art direction than to a casual mobile game. Surfaces should remain spacious, controlled, and elegant. Shapes, typography, and color should communicate care and quiet sophistication.

The feature must avoid:

- childish game style
- excessive animation
- cartoon UI

Motion, if present, should be subtle and sparse. Visual growth should feel refined and ambient rather than playful or attention-seeking.

# 6. Garden Page Structure

The Garden page should be designed as a contemplative visual overview rather than a dense dashboard.

Page layout should include:

- a clear page title and short framing statement
- a high-level garden visualization area
- chapter-level navigation or filtering
- an area for inspecting individual words or clusters
- compact summary statistics

Navigation should allow the learner to move between the whole garden view and chapter-specific views without losing orientation. The transition between macro and micro views should feel smooth and conceptually clear.

Chapter display should communicate the different learning territories. Each chapter should have its own visual presence while still belonging to the same overall garden. Chapters should be comparable in a way that helps the learner identify strong and weak areas.

Individual word display should support inspection of one word's state, recent learning condition, and relationship to the rest of its chapter. This view should feel informative and intimate rather than technical.

Statistics should remain lightweight. The goal is not to turn the page into an analytics screen, but to give enough structure for the learner to interpret the garden meaningfully.

# 7. Relationship With Existing Modules

## Vocabulary Library

Vocabulary Library remains the primary structured entry point for chapters and study sessions. Vocabulary Garden should not replace it. Instead, it should provide a more reflective, long-term visualization of the same learning body.

## Word Card Mode

Word Card Mode is one of the primary engines that changes word condition. The recognition decisions made there should directly influence word growth inside the garden.

## Word List Mode

Word List Mode contributes through spelling work, scanning, and repeated status updates. It should remain a practical study surface, while Vocabulary Garden becomes the visual interpretation of accumulated learning outcomes.

## Personal Vocabulary Bank

Personal Vocabulary Bank should either have its own related garden layer or appear as a special subset within the broader garden. This makes personally collected words feel meaningfully connected to the learner's overall landscape.

## AI Review Coach

AI Review Coach should interpret the garden when appropriate. It can use garden states to identify neglected zones, unstable chapters, or promising areas of progress, making the garden not only visual but actionable.

# 8. Data Requirements

Vocabulary Garden needs product-level access to the following information from existing vocabulary data:

- word identity
- chapter membership
- current learning status
- review history signals
- recognition confidence signals
- review failure signals
- memory box state
- spelling performance signals
- whether a word belongs to the main vocabulary system or the personal vocabulary bank
- date-based activity information where available

The feature should be built on existing learning truth rather than parallel or invented progress. Its visual state must be derived from actual learner behavior already recorded by the product.

# 9. Development Phases

## Phase 1: Basic visualization

Phase 1 should establish the garden as a readable visual layer over existing vocabulary progress. The goal is to make chapter and word growth visible in a stable, elegant, non-interactive or lightly interactive format.

## Phase 2: Growth interaction

Phase 2 should deepen interactivity. The learner should be able to inspect word states more closely, navigate chapters more fluidly, and understand how review actions change the garden over time.

## Phase 3: Advanced AI features

Phase 3 should connect the garden to more intelligent guidance. This may include AI-driven interpretation of weak growth zones, personalized review suggestions, pattern-based insights, and emotionally intelligent coaching grounded in the garden's state.
