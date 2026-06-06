"""Resume parsing service."""

import re
from typing import List, Dict
from PyPDF2 import PdfReader
import pdfplumber


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file using pdfplumber (better accuracy)."""
    
    try:
        text = ""
        
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        
        return text.strip()
    
    except Exception as e:
        # Fallback to PyPDF2 if pdfplumber fails
        try:
            reader = PdfReader(file_path)
            text = ""
            
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            
            return text.strip()
        
        except Exception as fallback_error:
            raise Exception(
                f"Failed to extract text from PDF: {str(fallback_error)}"
            )


def extract_skills_from_text(text: str, known_skills: List[str]) -> List[Dict]:
    """
    Extract skills from resume text by matching with known skills.
    
    Args:
        text: Extracted resume text
        known_skills: List of skill names from database
    
    Returns:
        List of dicts with skill name and confidence
    """
    
    # Normalize text
    text_lower = text.lower()
    
    found_skills = []
    
    for skill_name in known_skills:
        skill_lower = skill_name.lower()
        
        # Simple keyword matching (can be enhanced with NLP later)
        if skill_lower in text_lower:
            found_skills.append({
                "name": skill_name,
                "confidence": "high" if skill_lower in text_lower else "medium"
            })
    
    return found_skills


def extract_email_from_text(text: str) -> str:
    """Extract email address from resume text."""
    
    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    match = re.search(email_pattern, text)
    
    return match.group(0) if match else ""


def extract_phone_from_text(text: str) -> str:
    """Extract phone number from resume text."""
    
    # Common phone patterns
    phone_patterns = [
        r'\+?\d[\d\s\-\(\)]{7,}\d',
        r'\(\d{3}\)\s?\d{3}[\-]?\d{4}',
        r'\d{3}[\-]?\d{3}[\-]?\d{4}',
    ]
    
    for pattern in phone_patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0)
    
    return ""


def extract_links_from_text(text: str) -> Dict[str, str]:
    """Extract GitHub, LinkedIn URLs from resume text."""
    
    links = {}
    
    # GitHub
    github_match = re.search(r'github\.com/[a-zA-Z0-9_-]+', text)
    if github_match:
        links['github'] = f"https://{github_match.group(0)}"
    
    # LinkedIn
    linkedin_match = re.search(r'linkedin\.com/in/[a-zA-Z0-9_-]+', text)
    if linkedin_match:
        links['linkedin'] = f"https://{linkedin_match.group(0)}"
    
    return links
