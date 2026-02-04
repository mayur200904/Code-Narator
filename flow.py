from pocketflow import Flow
# Import all node classes from nodes.py
from nodes import (
    FetchRepo,
    IdentifyAbstractions,
    AnalyzeRelationships,
    OrderChapters,
    WriteChapters,
    CombineTutorial
)
from nodes_video import (
    LoadExistingTutorial,
    GenerateVideoScript,
    GenerateAudio,
    GenerateVisuals,
    AssembleVideo
)

def create_tutorial_flow(video_mode="none"): # modes: "none", "only"
    """
    Creates and returns the codebase tutorial generation flow.
    video_mode: 
      - "none": Text tutorial only.
      - "only": Video generation only (loads existing chapters).
    """

    # Instantiate nodes
    fetch_repo = FetchRepo()
    identify_abstractions = IdentifyAbstractions(max_retries=5, wait=20)
    analyze_relationships = AnalyzeRelationships(max_retries=5, wait=20)
    order_chapters = OrderChapters(max_retries=5, wait=20)
    write_chapters = WriteChapters(max_retries=5, wait=20) # This is a BatchNode
    combine_tutorial = CombineTutorial()

    # Video nodes
    load_existing = LoadExistingTutorial()
    generate_video_script = GenerateVideoScript(max_retries=3)
    generate_visuals = GenerateVisuals()
    generate_audio = GenerateAudio()
    assemble_video = AssembleVideo()

    # Define flows based on mode
    if video_mode == "only":
        # Video Only Flow: Load -> Script -> Visuals -> Audio -> Assemble
        load_existing >> generate_video_script
        generate_video_script >> generate_visuals
        generate_visuals >> generate_audio
        generate_audio >> assemble_video
        
        tutorial_flow = Flow(start=load_existing)
        
    else:
        # Standard Flow (Text Only)
        fetch_repo >> identify_abstractions
        identify_abstractions >> analyze_relationships
        analyze_relationships >> order_chapters
        order_chapters >> write_chapters
        write_chapters >> combine_tutorial
        
        tutorial_flow = Flow(start=fetch_repo)

    return tutorial_flow
