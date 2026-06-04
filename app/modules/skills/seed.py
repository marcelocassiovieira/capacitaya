from sqlalchemy.orm import Session

from app.modules.skills import repository

_INITIAL_SKILLS: list[str] = [
    # Lenguajes
    "Python", "JavaScript", "TypeScript", "Java", "Go", "Rust", "C#", "PHP",
    "Ruby", "Kotlin", "Swift",
    # Frameworks web
    "React", "Vue", "Angular", "Next.js", "FastAPI", "Django", "Spring Boot",
    "Laravel", "Rails", "Express", "NestJS", "Flask", "Fastify", "Gin", "Echo",
    # Bases de datos
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Elasticsearch",
    "DynamoDB",
    # DevOps / infra
    "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Terraform", "Ansible",
    "GitHub Actions", "Linux", "CI/CD", "Jenkins", "Nginx", "Prometheus", "Grafana",
    # Datos / IA
    "SQL", "Pandas", "NumPy", "TensorFlow", "PyTorch", "Scikit-learn",
    "Apache Spark", "dbt", "Airflow", "Power BI", "Tableau", "Kafka",
    # Herramientas generales
    "Git", "REST APIs", "GraphQL", "gRPC", "Agile/Scrum", "Jira", "Figma",
    "Postman", "VS Code", "Linux Shell", "Bash",
]


def seed_skills_if_empty(db: Session) -> None:
    if repository.count(db) == 0:
        repository.bulk_create(db, _INITIAL_SKILLS)
