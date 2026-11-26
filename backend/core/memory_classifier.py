from backend.core.groq_client import create_groq_client

client = create_groq_client()


def classify_memory_query(user_query):

    response = client.chat.completions.create(

        model="openai/gpt-oss-120b",

        messages=[

            {
                "role": "system",
                "content": """
You are a memory query classifier.

Determine what category of memory
the user is asking about.

Allowed categories:

preference
profession
goal
skill
personal

If the user is NOT asking about stored memories,
return:

NONE

Return ONLY one word.
"""
            },

            {
                "role": "user",
                "content": user_query
            }

        ],

        temperature=0

    )

    return response.choices[0].message.content.strip().lower()