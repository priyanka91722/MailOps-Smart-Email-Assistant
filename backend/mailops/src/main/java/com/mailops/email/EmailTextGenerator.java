package com.mailops.email;

public interface EmailTextGenerator {
    String generate(String systemPrompt, String userPrompt);
}
