
using Application.Activities;
using Application.Comments;
using AutoMapper;
using Domain;

namespace Application.Core;

public class MappingProfiles : Profile
{
    public MappingProfiles()
    {
        CreateMap<Activity, Activity>();

        CreateMap<Activity, ActivityDTO>()
            .ForMember(d => d.HostUsername, options => options.MapFrom(source => source.Attendees.FirstOrDefault(x => x.IsHost).AppUser.UserName));

        CreateMap<ActivityAttendee, AttendeeDTO>()
            .ForMember(d => d.DisplayName, options => options.MapFrom(source => source.AppUser.DisplayName))
            .ForMember(d => d.Username, options => options.MapFrom(source => source.AppUser.UserName))
            .ForMember(d => d.Bio, options => options.MapFrom(source => source.AppUser.Bio))
            .ForMember(d => d.Image, options => options.MapFrom(source => source.AppUser.Photos.FirstOrDefault(x => x.IsMain).Url));

        CreateMap<AppUser, Profiles.Profile>()
            .ForMember(d => d.Image, options => options.MapFrom(source => source.Photos.FirstOrDefault(x => x.IsMain).Url));

        CreateMap<Comment, CommentDto>()
            .ForMember(d => d.DisplayName, options => options.MapFrom(source => source.Author.DisplayName))
            .ForMember(d => d.Username, options => options.MapFrom(source => source.Author.UserName))
            .ForMember(d => d.Image, options => options.MapFrom(source => source.Author.Photos.FirstOrDefault(x => x.IsMain).Url));
    }   
}
