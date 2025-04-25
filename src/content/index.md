---
title: "My index-page"
permalink: index.html
---

{%- extends "layouts/base.njk" -%}

{% block content %}

{{ component.h({
  level: 2,
  text: "What a great headline"
}) }}

<ul>
{% for n in navigation%}
    <li><a href="{{n.url}}">{{n.item}}</a></li>
{% endfor %}
</ul>
{% endblock %}
