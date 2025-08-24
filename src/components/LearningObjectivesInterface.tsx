import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Search, Filter } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface LearningObjective {
  id: number;
  "Objective": string;
  "Plain Language": string;
  "Grade Level": string;
  "Subject": string;
  "Below Basic": string;
  "Standard": string;
  "Proficient": string;
  "Advanced": string;
  "Priority Level": string;
  "Rationale for Priority Level": string;
  "Basic": string;
}

const LearningObjectivesInterface = () => {
  const [objectives, setObjectives] = useState<LearningObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"grade" | "subject" | "priority">("grade");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchObjectives = async () => {
      const { data, error } = await supabase
        .from('learning_objectives')
        .select('*');
      
      if (error) {
        console.error('Error fetching learning objectives:', error);
      } else {
        setObjectives(data || []);
      }
      setLoading(false);
    };

    fetchObjectives();
  }, []);

  const uniqueGrades = useMemo(() => 
    [...new Set(objectives.map(obj => obj["Grade Level"]).filter(Boolean))].sort(),
    [objectives]
  );

  const uniqueSubjects = useMemo(() => 
    [...new Set(objectives.map(obj => obj["Subject"]).filter(Boolean))].sort(),
    [objectives]
  );

  const uniquePriorities = useMemo(() => 
    [...new Set(objectives.map(obj => obj["Priority Level"]).filter(Boolean))].sort(),
    [objectives]
  );

  const filteredAndSortedObjectives = useMemo(() => {
    let filtered = objectives.filter(obj => {
      const matchesSearch = searchTerm === "" || 
        obj["Objective"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obj["Standard"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obj["Plain Language"]?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGrade = gradeFilter === "all" || gradeFilter === "" || obj["Grade Level"] === gradeFilter;
      const matchesSubject = subjectFilter === "all" || subjectFilter === "" || obj["Subject"] === subjectFilter;
      const matchesPriority = priorityFilter === "all" || priorityFilter === "" || obj["Priority Level"] === priorityFilter;

      return matchesSearch && matchesGrade && matchesSubject && matchesPriority;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "grade":
          return (a["Grade Level"] || "").localeCompare(b["Grade Level"] || "");
        case "subject":
          return (a["Subject"] || "").localeCompare(b["Subject"] || "");
        case "priority":
          return (a["Priority Level"] || "").localeCompare(b["Priority Level"] || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [objectives, searchTerm, gradeFilter, subjectFilter, priorityFilter, sortBy]);

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getPriorityBadgeColor = (priority: string) => {
    const priorityLower = priority?.toLowerCase() || "";
    if (priorityLower.includes("high")) return "bg-priority-high text-white";
    if (priorityLower.includes("moderate")) return "bg-priority-moderate text-white";
    if (priorityLower.includes("medium")) return "bg-priority-medium text-white";
    if (priorityLower.includes("low")) return "bg-priority-low text-white";
    return "bg-muted text-muted-foreground";
  };

  const getGradeBadgeColor = (grade: string) => {
    const gradeNormalized = grade?.replace(/\s+/g, "") || "";
    if (gradeNormalized === "6th") return "bg-grade-6 text-white";
    if (gradeNormalized === "7th") return "bg-grade-7 text-white";
    if (gradeNormalized === "8th") return "bg-grade-8 text-white";
    if (gradeNormalized.includes("6th,7th,8th")) return "bg-grade-6-7-8 text-white";
    if (gradeNormalized.includes("6th,8th")) return "bg-grade-6-8 text-white";
    if (gradeNormalized.includes("7th,8th")) return "bg-grade-7-8 text-white";
    if (gradeNormalized.includes("8th,6th,7th")) return "bg-grade-8-6-7 text-white";
    return "bg-grade-mixed text-white";
  };

  const getSubjectBadgeColor = (subject: string) => {
    const subjectLower = subject?.toLowerCase() || "";
    if (subjectLower === "ela") return "bg-subject-ela text-white";
    if (subjectLower === "math") return "bg-subject-math text-white";
    if (subjectLower === "science") return "bg-subject-science text-white";
    if (subjectLower === "social studies") return "bg-subject-social-studies text-white";
    if (subjectLower === "algebra i") return "bg-subject-algebra text-white";
    return "bg-subject-default text-white";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto">
          <div className="text-center py-12">
            <div className="text-lg text-muted-foreground">Loading learning objectives...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Learning Objectives Database</h1>
          <p className="text-muted-foreground">
            Browse and filter educational standards and learning objectives
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search objectives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {uniqueGrades.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {uniqueSubjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {uniquePriorities.map(priority => (
                    <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: "grade" | "subject" | "priority") => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grade">Sort by Grade</SelectItem>
                  <SelectItem value="subject">Sort by Subject</SelectItem>
                  <SelectItem value="priority">Sort by Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredAndSortedObjectives.length} of {objectives.length} learning objectives
          </p>
        </div>

        {/* Objectives List */}
        <div className="space-y-4">
          {filteredAndSortedObjectives.map((objective) => (
            <Card key={objective.id} className="border border-border hover:border-primary/50 transition-colors">
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <CardHeader 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleExpanded(objective.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {expandedRows.has(objective.id) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <Badge className={`text-xs ${getGradeBadgeColor(objective["Grade Level"])}`}>
                              {objective["Grade Level"]}
                            </Badge>
                            <Badge className={`text-xs ${getSubjectBadgeColor(objective["Subject"])}`}>
                              {objective["Subject"]}
                            </Badge>
                            <Badge className={getPriorityBadgeColor(objective["Priority Level"])}>
                              {objective["Priority Level"]}
                            </Badge>
                          </div>
                        </div>
                        <CardTitle className="text-lg font-medium text-left">
                          {objective["Standard"]}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 text-left">
                          {objective["Objective"]}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="border-t border-border pt-6">
                      <div className="grid gap-6">
                        {/* Plain Language */}
                        {objective["Plain Language"] && (
                          <div>
                            <h4 className="font-medium text-sm text-foreground mb-2">Plain Language</h4>
                            <p className="text-sm text-muted-foreground">
                              {objective["Plain Language"]}
                            </p>
                          </div>
                        )}

                        {/* Performance Levels */}
                        <div>
                          <h4 className="font-medium text-sm text-foreground mb-3">Performance Levels</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {objective["Below Basic"] && (
                              <div className="bg-muted/50 p-3 rounded-lg">
                                <h5 className="font-medium text-xs text-foreground mb-1">Below Basic</h5>
                                <p className="text-xs text-muted-foreground">
                                  {objective["Below Basic"]}
                                </p>
                              </div>
                            )}
                            {objective["Basic"] && (
                              <div className="bg-muted/50 p-3 rounded-lg">
                                <h5 className="font-medium text-xs text-foreground mb-1">Basic</h5>
                                <p className="text-xs text-muted-foreground">
                                  {objective["Basic"]}
                                </p>
                              </div>
                            )}
                            {objective["Proficient"] && (
                              <div className="bg-muted/50 p-3 rounded-lg">
                                <h5 className="font-medium text-xs text-foreground mb-1">Proficient</h5>
                                <p className="text-xs text-muted-foreground">
                                  {objective["Proficient"]}
                                </p>
                              </div>
                            )}
                            {objective["Advanced"] && (
                              <div className="bg-muted/50 p-3 rounded-lg">
                                <h5 className="font-medium text-xs text-foreground mb-1">Advanced</h5>
                                <p className="text-xs text-muted-foreground">
                                  {objective["Advanced"]}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Priority Rationale */}
                        {objective["Rationale for Priority Level"] && (
                          <div>
                            <h4 className="font-medium text-sm text-foreground mb-2">Priority Rationale</h4>
                            <p className="text-sm text-muted-foreground">
                              {objective["Rationale for Priority Level"]}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {filteredAndSortedObjectives.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No learning objectives found matching your criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LearningObjectivesInterface;