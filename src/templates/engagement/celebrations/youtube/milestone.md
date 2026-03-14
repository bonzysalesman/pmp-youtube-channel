🎉 **HUGE CONGRATULATIONS {{name}}!** 🎉

You just hit an amazing milestone: **{{milestone.title}}**! 

{{#if milestone.description}}
{{milestone.description}}
{{/if}}

{{#if studyWeek}}
You're now {{progressPercentage studyWeek}}% through the 13-week PMP study plan - that's incredible progress!
{{/if}}

{{#if milestone.type}}
{{#eq milestone.type "study_week"}}
🎯 **Week {{milestone.value}} Complete!** 
Keep this momentum going - you're building the habits that lead to PMP success!
{{/eq}}

{{#eq milestone.type "engagement_points"}}
💪 **{{milestone.value}} Engagement Points!** 
Your active participation is inspiring others in our community!
{{/eq}}

{{#eq milestone.type "days_active"}}
📅 **{{milestone.value}} Days of Consistent Learning!** 
Consistency is the key to PMP certification success!
{{/eq}}
{{/if}}

Keep up the amazing work! The entire community is cheering you on! 👏

*What's been your biggest learning so far? Share it below!*