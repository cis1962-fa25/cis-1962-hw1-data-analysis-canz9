[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/PA8fMuFu)
# Homework 1 AI Synthesis Activity

Only complete one of the assignments below! You can delete the other assignment in this document once you've made your choice.

## Activity: You used AI 
### Part 1
> Cite the usage by including screenshots, a text transcript, or a link to the conversation with your AI of choice. Make sure to include any context, instructions, and all the conversations you had with the AI.
I was having trouble with 2 tests in step 3, so I asked ChatGPT to explain the error messages I was getting. This is ChatGPT's reply:
What the error lines mean

Sentiment by App (Duolingo)

AssertionError: Expected values to be strictly equal:
0 !== 8


The autograder expected a specific count (very likely one of positive, neutral, or negative) for the app "Duolingo" to be 8.

Your function returned 0 for that same count.

Translation: for the Duolingo row in the array your sentimentAnalysisApp(...) returns, the grader looked at (say) the .positive field and saw 0 but expected 8.

Sentiment by Language (es)

AssertionError: Expected values to be strictly equal:
0 !== 30


Similarly, the autograder expected a particular count for the language "es" to be 30.

Your function returned 0 for that count.

Translation: for the es row in the array your sentimentAnalysisLang(...) returns, the grader looked at (say) .neutral (or .positive/.negative) and saw 0 but expected 30.

What this usually means (common causes)

When you see “expected 8/30 but got 0” for a specific app or language, it almost always comes down to one of these:

The row the grader is reading isn’t the right one.

Many graders read by array index (e.g., result[3]) instead of searching by name. If your output array order is different from what they expect, they’ll inspect the wrong row and see zeros.

Fix: sort your output deterministically (e.g., by app_name for apps and lang_name for languages) before returning.

The entry is missing because the key name doesn’t match the dataset.

Example: using app vs app_name, or language vs review_language. If your function groups on a field name the grader isn’t expecting, they won’t find “Duolingo”/“es” and they’ll read zero.

You already passed the cleaning/type tests, so your field names likely match; but it’s still worth double-checking you aggregate on app_name and review_language, and you return exactly { app_name, positive, neutral, negative } and { lang_name, positive, neutral, negative }.

Your sentiment thresholds don’t match what the grader expects.

The instructions say:

positive if rating > 4.0

neutral if rating between 2.0 and 3.0

negative if rating < 2.0

That leaves a gap for ratings > 3.0 and ≤ 4.0. If the grader expects those to be neutral or counts them in a particular way, but your code puts them elsewhere, you can get mismatched counts. (This wouldn’t usually give you zero, but it can if they’re checking a specific bucket.)

You aggregate without first assigning row.sentiment, and the grader checks that property specifically.

The spec says to “add a property to each record called sentiment”. Some tests verify that field exists on each review before/while counting.

Quick self-checks you can run

To pinpoint which case you hit, add 3 tiny prints in main.js just after building cleaned:

const apps = sentimentAnalysisApp(cleaned);
const langs = sentimentAnalysisLang(cleaned);

// 1) Can we find Duolingo at all?
const duo = apps.find(x => x.app_name === "Duolingo");
console.log("Duolingo row:", duo);

// 2) Can we find Spanish ("es")?
const es = langs.find(x => x.lang_name === "es");
console.log("es row:", es);

// 3) How many reviews for Duolingo exist in cleaned?
const duoRows = cleaned.filter(r => r.app_name === "Duolingo");
console.log("Duolingo cleaned rows:", duoRows.length);


Interpretation:

If duo or es prints undefined, your row is missing or out of expected order (sorting will help, but missing means the key name/grouping is off).

If duoRows.length is 0, Duolingo rows were filtered out in cleaning (e.g., because of our earlier filtering rule—though you already passed the cleaning test, so this is less likely).

If duo exists but one of the counts is 0 when you expect a positive number, then it’s probably the sentiment thresholds or the grader is looking at the wrong index/order.

What usually fixes it fastest

Sort the outputs:

sentimentAnalysisApp: sort by app_name ascending.

sentimentAnalysisLang: sort by lang_name ascending.

Ensure you actually set row.sentiment = labelSentiment(row.rating) before counting.

Match the exact field names the autograder expects in the returned objects:

Apps: { app_name, positive, neutral, negative }

Languages: { lang_name, positive, neutral, negative }

Match the grader’s thresholds precisely. If they truly use the prompt as-is, your labelSentiment should map:

rating > 4.0 → positive

rating < 2.0 → negative

everything else (2.0 ≤ rating ≤ 4.0) → neutral
(That covers the 3.0–4.0 region explicitly.)

After that, I was still struggling with some errors, so I asked chatGPT to help me again and it suggested I use .trim. Here is the reply: 
Why .trim() is needed

When you read data from a CSV, every field comes in as a string. Sometimes those strings have extra spaces before or after, like:

" Grammarly "

" en"

"" (just spaces)

If you don’t clean them up:

" Grammarly " and "Grammarly" would look like different app names, so your counts would be wrong.

" " would look like a non-empty string even though it’s basically empty.

.trim() removes all whitespace at the start and end of a string:

" Grammarly ".trim(); // "Grammarly"
"   ".trim();         // ""

### Part 2
> Write about why you used AI. Was there a gap in knowledge you wanted to fill? Were the answers through traditional search engines not adequate? Did you want to let AI help you format something in a quick manner?
I used AI because I was not understanding the errors I was getting and what I needed to fix, so asking AI to explain the error messages was helpful to breakdown exactly what was going wrong in my code and see suggestions for potential fixes. I also had a gap in knowledge in dealing with the csv file, and AI helped me realize that I might need to add a .trim() method to help my implementation read in information from the csv file correctly. 

### Part 3
> Evaluate the AI's response. If you asked multiple questions, you can pick one of the responses the AI generated. Does the AI answer your question properly? Does it hallucinate any details? Could there be room to improve this response through manual editing? Did you accept this response fully or adapt parts of it into your work?
Yes, it did answer my question properly. I did adapt some parts of its suggestions for helping the two tests I was struggling with pass.

### Part 4
> If you used unfamiliar syntax or concepts generated by AI within your assignment, be sure to research them and explain what those concepts are to demonstrate your understanding.
I used .trim(), a string method suggested by AI. This method removes any white space at the start or end of a string. This helped clean up data from the csv file for this homework.
------------------------------------------------------------------------------------------------
