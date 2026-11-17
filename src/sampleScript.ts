export const DEFAULT_SCRIPT = `# Building Resilient Real-World Software Systems

## 1. Welcome & Introduction
Good morning everyone, and welcome! It's fantastic to be speaking with all 100 of you today.

[PAUSE 2s]

When you're studying software engineering in university, you spend a lot of time learning algorithms, data structures, and how to write clean code that passes unit tests.

[EMPHASIZE]
But when you step into the industry and start building production systems that serve millions of users across the globe, the rules of the game change dramatically.

[PAUSE 3s]

[SLIDE: Architecture Overview]
Today, I want to share the core architectural principles that separate amateur code from resilient, production-grade engineering.

## 2. The Illusion of Reliability
First, let's address the biggest misconception that junior engineers often bring into their first job: the belief that the network is reliable.

[PAUSE 2s]

In your local development environment on your laptop, database queries return in sub-milliseconds, servers don't crash unexpectedly, and memory is virtually free.

[QUESTION: Have you ever had a local script fail due to network partition?]

In production, however, everything that can fail, will fail:
- Third-party APIs will time out.
- Disks will fill up.
- Cloud providers will have regional outages.
- Deployments will have subtle race conditions.

[PAUSE 3s]

[EMPHASIZE]
A senior engineer does not write code hoping that components won't fail. A senior engineer designs systems that assume failure is inevitable, and builds self-healing blast walls around every critical path.

## 3. Core Architectural Patterns
[SLIDE: Circuit Breakers & Backpressure]
Let's talk about three critical patterns you must master:

First: The Circuit Breaker pattern.
When a downstream microservice starts lagging or throwing 500 errors, your service must not queue thousands of pending requests until its own thread pool is exhausted. You trip the circuit, fail fast, and return a degraded or cached response immediately.

[PAUSE 2s]

Second: Backpressure and Rate Limiting.
Never allow an unexpected spike in user traffic to crash your ingestion workers. You buffer work into persistent queues, throttle incoming connections gracefully, and preserve system stability over throughput.

[PAUSE 2s]

Third: Idempotency.
In distributed systems, the network will drop acknowledgements. Clients will retry requests. If your payment or order endpoint is not strictly idempotent, a retry will charge a customer twice or double-dispatch goods.

[PAUSE 4s]

## 4. Advice for Your Engineering Careers
As you prepare to graduate and step into software engineering teams, remember this:
The code you write is only 20% of your value.

[EMPHASIZE]
The remaining 80% is your ability to communicate complex trade-offs, to write clear technical design documents, to deeply understand user needs, and to stay calm and analytical when production is on fire.

[PAUSE 3s]

Be curious. Read post-mortems from companies like Netflix, AWS, and Cloudflare. Learn from the failures of others rather than waiting to make every mistake yourself.

## 5. Q&A and Open Discussion
[SLIDE: Q&A]
Thank you all for your focus and energy this morning.
Let's open the floor up for questions. What questions do you have about distributed architecture, system design, or engineering careers?
`;
