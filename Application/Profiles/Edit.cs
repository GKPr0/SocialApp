using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles;

public class Edit
{
    
    public class Command : IRequest<Result<Unit>>
    {
        public string DisplayName { get; set; }
        public string? Bio { get; set; }
    }

    public class CommandValidator : AbstractValidator<Command>
    {
        public CommandValidator()
        {
            RuleFor(x => x.DisplayName).NotEmpty();
        }
    }

    public class Handler : IRequestHandler<Command, Result<Unit>>
    {
        private readonly DataContext context;
        private readonly IUserAccessor userAccessor;

        public Handler(DataContext context, IUserAccessor userAccessor)
        {
            this.context = context;
            this.userAccessor = userAccessor;
        }

        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var profile = await context.Users.FirstOrDefaultAsync(u => u.UserName == userAccessor.GetUserName());

            if (profile == null)
                return null;

            profile.DisplayName = request.DisplayName;
            profile.Bio = request.Bio ?? profile.Bio;

            context.Entry(profile).State = EntityState.Modified;

            var success = await context.SaveChangesAsync() > 0;

            if (success) return Result<Unit>.Success(Unit.Value);

            return Result<Unit>.Failure("Problem updating profile");
        }
    }
}
